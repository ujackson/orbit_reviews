# frozen_string_literal: true

require "ostruct"

class ApplicationSerializer
  include Alba::Resource
  include Typelizer::DSL

  # Alba defines the outbound JSON contract for Inertia props.
  # Typelizer's Alba plugin reads these transformed names directly, so
  # serializer keys and generated frontend types stay aligned in camelCase.
  transform_keys :lower_camel

  def self.form_default_overrides
    {}
  end

  def self.default_form_data
    data = _attributes.keys.index_with { "" }.merge(form_default_overrides)

    new(OpenStruct.new(data)).serializable_hash
  end
end
