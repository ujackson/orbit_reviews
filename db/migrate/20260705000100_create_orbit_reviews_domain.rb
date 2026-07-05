class CreateOrbitReviewsDomain < ActiveRecord::Migration[8.1]
  def change
    add_column :workspaces, :name, :string, null: false, default: "Acme Corp"

    create_table :users, id: :uuid do |t|
      t.string :workos_user_id
      t.string :email, null: false
      t.string :first_name
      t.string :last_name
      t.string :profile_picture_url
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index :email
      t.index :workos_user_id, unique: true
    end

    create_table :memberships do |t|
      t.uuid :workspace_id, null: false
      t.uuid :user_id, null: false
      t.string :role, null: false, default: "member"
      t.string :status, null: false, default: "active"
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :user_id ], unique: true
      t.index [ :workspace_id, :role ]
    end

    create_table :review_sources do |t|
      t.uuid :workspace_id, null: false
      t.string :provider, null: false
      t.string :name, null: false
      t.string :category, null: false
      t.string :status, null: false, default: "healthy"
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :provider ], unique: true
      t.index [ :workspace_id, :status ]
    end

    create_table :review_source_accounts do |t|
      t.uuid :workspace_id, null: false
      t.references :review_source, null: false, foreign_key: true
      t.string :name, null: false
      t.string :external_account_id
      t.string :status, null: false, default: "healthy"
      t.string :auth_status, null: false, default: "connected"
      t.datetime :last_sync_at
      t.datetime :latest_review_at
      t.integer :records_count, null: false, default: 0
      t.string :sync_frequency
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :status ]
      t.index [ :workspace_id, :external_account_id ]
    end

    create_table :review_sync_runs do |t|
      t.uuid :workspace_id, null: false
      t.references :review_source_account, null: false, foreign_key: true
      t.string :status, null: false
      t.datetime :started_at
      t.datetime :finished_at
      t.integer :records_seen, null: false, default: 0
      t.integer :records_created, null: false, default: 0
      t.integer :records_updated, null: false, default: 0
      t.text :error_message
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :status ]
      t.index [ :workspace_id, :started_at ]
    end

    create_table :reviews do |t|
      t.uuid :workspace_id, null: false
      t.references :review_source_account, null: false, foreign_key: true
      t.string :external_id, null: false
      t.string :source_provider, null: false
      t.integer :rating, null: false
      t.string :title, null: false
      t.text :body, null: false
      t.string :author_name
      t.string :product_name
      t.string :app_version
      t.string :platform
      t.string :region
      t.string :location_name
      t.string :language, default: "en"
      t.datetime :reviewed_at, null: false
      t.string :response_status, null: false, default: "none"
      t.string :workflow_status, null: false, default: "needs_response"
      t.string :sentiment, null: false, default: "neutral"
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :external_id, :source_provider ], unique: true
      t.index [ :workspace_id, :workflow_status ]
      t.index [ :workspace_id, :sentiment ]
      t.index [ :workspace_id, :reviewed_at ]
    end

    create_table :review_analyses do |t|
      t.uuid :workspace_id, null: false
      t.references :review, null: false, foreign_key: true
      t.text :summary
      t.string :sentiment
      t.string :severity
      t.jsonb :signals, null: false, default: []
      t.jsonb :themes, null: false, default: []
      t.integer :related_review_count, null: false, default: 0
      t.jsonb :analysis_metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :review_id ], unique: true
    end

    create_table :review_themes do |t|
      t.uuid :workspace_id, null: false
      t.string :name, null: false
      t.text :description
      t.string :sentiment, null: false, default: "mixed"
      t.integer :review_count, null: false, default: 0
      t.decimal :share, precision: 6, scale: 4, null: false, default: 0
      t.decimal :change_percent, precision: 8, scale: 2, null: false, default: 0
      t.string :status, null: false, default: "monitoring"
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :name ], unique: true
      t.index [ :workspace_id, :status ]
    end

    create_table :review_theme_assignments do |t|
      t.uuid :workspace_id, null: false
      t.references :review, null: false, foreign_key: true
      t.references :review_theme, null: false, foreign_key: true

      t.timestamps
      t.index [ :workspace_id, :review_id, :review_theme_id ], unique: true, name: "idx_review_theme_assignments_unique"
    end

    create_table :review_insights do |t|
      t.uuid :workspace_id, null: false
      t.string :title, null: false
      t.string :severity, null: false
      t.decimal :change_percent, precision: 8, scale: 2, null: false, default: 0
      t.integer :evidence_count, null: false, default: 0
      t.string :scope
      t.string :status, null: false, default: "new"
      t.string :owner_name
      t.datetime :detected_at
      t.datetime :last_updated_at
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :severity ]
      t.index [ :workspace_id, :status ]
    end

    create_table :review_alerts do |t|
      t.uuid :workspace_id, null: false
      t.string :title, null: false
      t.string :severity, null: false
      t.jsonb :evidence, null: false, default: {}
      t.string :status, null: false, default: "active"
      t.string :owner_name
      t.datetime :detected_at
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :severity ]
      t.index [ :workspace_id, :status ]
    end

    create_table :review_reply_drafts do |t|
      t.uuid :workspace_id, null: false
      t.references :review, null: false, foreign_key: true
      t.text :body, null: false
      t.string :status, null: false, default: "draft"
      t.jsonb :grounding, null: false, default: {}
      t.uuid :created_by_id
      t.uuid :approved_by_id
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :review_id ]
    end

    create_table :review_assignments do |t|
      t.uuid :workspace_id, null: false
      t.references :review, null: false, foreign_key: true
      t.uuid :user_id, null: false
      t.string :status, null: false, default: "open"

      t.timestamps
      t.index [ :workspace_id, :review_id, :user_id ], unique: true
    end

    create_table :automation_rules do |t|
      t.uuid :workspace_id, null: false
      t.string :name, null: false
      t.string :trigger_type, null: false
      t.jsonb :conditions, null: false, default: {}
      t.string :action_type, null: false
      t.jsonb :action_config, null: false, default: {}
      t.string :status, null: false, default: "active"
      t.datetime :last_run_at
      t.integer :runs_count, null: false, default: 0
      t.text :failure_message

      t.timestamps
      t.index [ :workspace_id, :status ]
      t.index [ :workspace_id, :name ], unique: true
    end

    create_table :automation_runs do |t|
      t.uuid :workspace_id, null: false
      t.references :automation_rule, null: false, foreign_key: true
      t.string :status, null: false
      t.datetime :started_at
      t.datetime :finished_at
      t.text :error_message
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
      t.index [ :workspace_id, :status ]
      t.index [ :workspace_id, :started_at ]
    end

    add_foreign_key :memberships, :workspaces
    add_foreign_key :memberships, :users
    add_foreign_key :review_sources, :workspaces
    add_foreign_key :review_source_accounts, :workspaces
    add_foreign_key :review_sync_runs, :workspaces
    add_foreign_key :reviews, :workspaces
    add_foreign_key :review_analyses, :workspaces
    add_foreign_key :review_themes, :workspaces
    add_foreign_key :review_theme_assignments, :workspaces
    add_foreign_key :review_insights, :workspaces
    add_foreign_key :review_alerts, :workspaces
    add_foreign_key :review_reply_drafts, :workspaces
    add_foreign_key :review_reply_drafts, :users, column: :created_by_id
    add_foreign_key :review_reply_drafts, :users, column: :approved_by_id
    add_foreign_key :review_assignments, :workspaces
    add_foreign_key :review_assignments, :users
    add_foreign_key :automation_rules, :workspaces
    add_foreign_key :automation_runs, :workspaces
  end
end
