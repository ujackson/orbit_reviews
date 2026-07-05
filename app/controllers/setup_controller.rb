class SetupController < InertiaController
  allow_authenticated_without_workspace only: %i[show update]

  STEP_FIELDS = {
    "workspace" => %i[workspace_name industry],
    "team" => %i[team_size role],
    "channels" => %i[use_cases channels]
  }.freeze

  def show
    if Current.workspace.present?
      redirect_to workspace_path(Current.workspace.id)
      return
    end

    current_step = valid_step(params[:step])
    furthest_step = furthest_accessible_step

    # Redirect if trying to skip ahead
    if current_step != "complete" && step_index(current_step) > step_index(furthest_step)
      redirect_to setup_step_path(step: furthest_step)
      return
    end

    render inertia: {
      currentStep: current_step,
      setupOptions: SetupOptionsSerializer.new(nil).to_h,
      setupForm: SetupFormSerializer.new(OpenStruct.new(session[:setup_data] || {})).serializable_hash.reverse_merge(SetupFormSerializer.default_form_data),
      organizationDomainRecommendation: organization_domain_recommendation
    }
  end

  def update
    if Current.workspace.present?
      redirect_to workspace_path(Current.workspace.id)
      return
    end

    current_step = params[:step]
    errors = validate_step(current_step)

    if errors.present?
      redirect_to setup_step_path(step: current_step), inertia: { errors: }
      return
    end

    # Save to session
    session[:setup_data] = (session[:setup_data] || {}).merge(setup_params.to_h.compact.except("step"))

    # Move to next step or complete
    next_step = step_keys[step_index(current_step) + 1]

    if next_step.nil?
      complete_setup
    else
      redirect_to setup_step_path(step: next_step)
    end
  end

  private

  def setup_params
    params.permit(:step, :workspace_name, :industry, :team_size, :role, use_cases: [], channels: [])
  end

  def step_keys
    @step_keys ||= SetupOptionsSerializer::STEP_KEYS
  end

  def step_index(step)
    step_keys.index(step) || 0
  end

  def valid_step(step)
    step_keys.include?(step) ? step : step_keys.first
  end

  def furthest_accessible_step
    data = (session[:setup_data] || {}).with_indifferent_access

    STEP_FIELDS.each do |step, fields|
      return step if fields.any? { |field| Array(data[field]).blank? }
    end

    "complete"
  end

  def validate_step(step)
    return {} unless STEP_FIELDS.key?(step)

    data = setup_params
    errors = {}

    STEP_FIELDS[step].each do |field|
      errors[field] = [ "#{field.to_s.humanize} is required" ] if Array(data[field]).blank?
    end

    errors
  end

  def complete_setup
    workos_config = Rails.configuration.auth.fetch(:workos)
    result = ::Setup::CompleteWorkspaceProvisioning.new(
      user: Current.user,
      sealed_session: session_cookie_value,
      cookie_password: workos_config.fetch(:cookie_password),
      client_id: workos_config.fetch(:client_id),
      setup_data: session[:setup_data] || {}
    ).call

    set_session_cookie!(result.sealed_session)
    Current.workspace = result.workspace
    session[:setup] = session[:setup_data]
    session.delete(:setup_data)

    redirect_to workspace_settings_path(result.workspace.id, onboarding: "1"), flash: { success: "Welcome to #{result.organization.name}! 🎉" }
  rescue => e
    Rails.logger.error "Setup completion failed: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    redirect_to setup_step_path(step: "complete"), flash: { error: "We couldn't finish creating your workspace. Please try again." }
  end

  def organization_domain_recommendation
    return nil if Current.user.blank?

    email = EmailClassifier.extract_email(Current.user)
    return nil if email.blank?

    domain = EmailClassifier.recommended_organization_domain(email)
    return nil if domain.blank?

    {
      domain: domain,
      sourceEmail: email,
      workspaceName: EmailClassifier.recommended_workspace_name(email)
    }
  end
end
