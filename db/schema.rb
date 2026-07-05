# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_21_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "vector"

  create_table "ai_artifacts", force: :cascade do |t|
    t.bigint "ai_run_id", null: false
    t.string "artifact_type", null: false
    t.float "confidence"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "generated_at"
    t.jsonb "metadata", default: {}, null: false
    t.string "model"
    t.jsonb "payload", default: {}, null: false
    t.string "provider"
    t.boolean "stale", default: false, null: false
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["workspace_id", "conversation_id", "artifact_type"], name: "idx_ai_artifacts_workspace_conversation_type"
    t.index ["workspace_id", "conversation_id", "created_at"], name: "idx_ai_artifacts_workspace_conversation_created"
    t.index ["workspace_id", "stale"], name: "index_ai_artifacts_on_workspace_id_and_stale"
  end

  create_table "ai_embedding_records", force: :cascade do |t|
    t.text "content"
    t.string "content_id", null: false
    t.string "content_type", null: false
    t.datetime "created_at", null: false
    t.vector "embedding", limit: 1024
    t.jsonb "metadata", default: {}, null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "user_id"
    t.uuid "workspace_id", null: false
    t.index ["workspace_id", "content_type", "content_id"], name: "idx_ai_embeddings_workspace_content"
    t.index ["workspace_id", "created_at"], name: "index_ai_embedding_records_on_workspace_id_and_created_at"
    t.index ["workspace_id", "user_id"], name: "index_ai_embedding_records_on_workspace_id_and_user_id"
    t.index ["workspace_id"], name: "index_ai_embedding_records_on_workspace_id"
  end

  create_table "ai_runs", force: :cascade do |t|
    t.datetime "completed_at"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.text "error_message"
    t.jsonb "metadata", default: {}, null: false
    t.string "model"
    t.string "provider"
    t.datetime "started_at"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["workspace_id", "conversation_id"], name: "index_ai_runs_on_workspace_id_and_conversation_id"
    t.index ["workspace_id", "created_at"], name: "index_ai_runs_on_workspace_id_and_created_at"
    t.index ["workspace_id", "status"], name: "index_ai_runs_on_workspace_id_and_status"
  end

  create_table "attachments", force: :cascade do |t|
    t.text "ai_description"
    t.jsonb "ai_extracted_fields"
    t.text "ai_summary"
    t.integer "attachment_type", default: 5
    t.datetime "created_at", null: false
    t.string "download_url"
    t.string "external_id"
    t.string "filename", null: false
    t.bigint "message_id", null: false
    t.string "mime_type"
    t.integer "size", default: 0
    t.string "source"
    t.datetime "updated_at", null: false
    t.index ["external_id", "message_id"], name: "index_attachments_on_external_id_and_message", unique: true
    t.index ["message_id"], name: "index_attachments_on_message_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "external_id"
    t.string "name"
    t.string "organization"
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["workspace_id", "email"], name: "index_contacts_on_workspace_and_email", unique: true
  end

  create_table "conversations", force: :cascade do |t|
    t.text "ai_summary"
    t.integer "channel", default: 0
    t.datetime "created_at", null: false
    t.string "external_id", null: false
    t.string "external_source", null: false
    t.jsonb "labels", default: []
    t.datetime "last_message_at"
    t.jsonb "metadata"
    t.text "preview"
    t.integer "priority", default: 0
    t.bigint "sender_id"
    t.integer "status", default: 0
    t.string "subject"
    t.integer "unread_count", default: 0
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["channel"], name: "index_conversations_on_channel"
    t.index ["external_id", "external_source", "workspace_id"], name: "index_conversations_on_external_id_and_source_and_workspace", unique: true
    t.index ["last_message_at"], name: "index_conversations_on_last_message_at"
    t.index ["status"], name: "index_conversations_on_status"
    t.index ["workspace_id"], name: "index_conversations_on_workspace_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "ai_summary"
    t.text "body"
    t.integer "channel", default: 0
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.integer "direction", default: 0, null: false
    t.string "external_id", null: false
    t.string "external_source"
    t.boolean "has_attachments", default: false
    t.jsonb "labels", default: []
    t.jsonb "metadata"
    t.text "preview"
    t.integer "priority", default: 0
    t.bigint "sender_id", null: false
    t.integer "status", default: 0
    t.string "subject"
    t.datetime "timestamp"
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["direction"], name: "index_messages_on_direction"
    t.index ["external_id", "conversation_id"], name: "index_messages_on_external_id_and_conversation", unique: true
    t.index ["sender_id"], name: "index_messages_on_sender_id"
    t.index ["status"], name: "index_messages_on_status"
    t.index ["timestamp"], name: "index_messages_on_timestamp"
  end

  create_table "orbit_connect_audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.bigint "actor_id"
    t.string "actor_type"
    t.bigint "connection_id"
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.string "provider_key", null: false
    t.datetime "updated_at", null: false
    t.index ["actor_type", "actor_id"], name: "index_orbit_connect_audit_logs_on_actor"
    t.index ["connection_id"], name: "index_orbit_connect_audit_logs_on_connection_id"
    t.index ["provider_key", "action"], name: "idx_orbit_connect_audit_logs_action"
  end

  create_table "orbit_connect_connection_attempts", force: :cascade do |t|
    t.bigint "connection_id", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "initiator_id"
    t.string "initiator_type"
    t.jsonb "metadata", default: {}, null: false
    t.text "pkce_verifier"
    t.bigint "provider_app_id"
    t.string "provider_key", null: false
    t.jsonb "requested_scopes", default: [], null: false
    t.string "return_to"
    t.string "state_nonce", null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["connection_id"], name: "index_orbit_connect_connection_attempts_on_connection_id"
    t.index ["initiator_type", "initiator_id"], name: "index_orbit_connect_connection_attempts_on_initiator"
    t.index ["provider_app_id"], name: "index_orbit_connect_connection_attempts_on_provider_app_id"
    t.index ["status"], name: "index_orbit_connect_connection_attempts_on_status"
    t.index ["workspace_id"], name: "index_orbit_connect_connection_attempts_on_workspace_id"
  end

  create_table "orbit_connect_connections", force: :cascade do |t|
    t.jsonb "auth_metadata", default: {}, null: false
    t.string "auth_strategy", null: false
    t.datetime "created_at", null: false
    t.datetime "disconnected_at"
    t.string "external_account_id"
    t.string "external_name"
    t.integer "failure_count", default: 0, null: false
    t.jsonb "health_payload", default: {}, null: false
    t.string "health_status"
    t.uuid "initiator_id"
    t.string "initiator_type"
    t.datetime "last_synced_at"
    t.datetime "last_tested_at"
    t.datetime "last_webhook_at"
    t.integer "lock_version", default: 0, null: false
    t.datetime "next_sync_at"
    t.bigint "provider_app_id"
    t.string "provider_key", null: false
    t.jsonb "settings", default: {}, null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.uuid "workspace_id", null: false
    t.index ["initiator_type", "initiator_id"], name: "index_orbit_connect_connections_on_initiator"
    t.index ["provider_app_id"], name: "index_orbit_connect_connections_on_provider_app_id"
    t.index ["provider_key", "external_account_id"], name: "idx_orbit_connect_connections_external_account"
    t.index ["provider_key", "workspace_id"], name: "idx_orbit_connect_connections_workspace"
    t.index ["status"], name: "index_orbit_connect_connections_on_status"
    t.index ["workspace_id"], name: "index_orbit_connect_connections_on_workspace_id"
  end

  create_table "orbit_connect_credentials", force: :cascade do |t|
    t.text "access_token"
    t.datetime "access_token_expires_at"
    t.text "api_key"
    t.bigint "connection_id", null: false
    t.datetime "created_at", null: false
    t.string "credential_type", null: false
    t.jsonb "metadata", default: {}, null: false
    t.text "password"
    t.text "refresh_token"
    t.jsonb "scopes", default: [], null: false
    t.text "secret"
    t.datetime "updated_at", null: false
    t.index ["connection_id"], name: "index_orbit_connect_credentials_on_connection_id", unique: true
  end

  create_table "orbit_connect_provider_apps", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "client_id"
    t.text "client_secret"
    t.jsonb "config", default: {}, null: false
    t.datetime "created_at", null: false
    t.string "environment", null: false
    t.string "name", null: false
    t.string "provider_key", null: false
    t.jsonb "scopes", default: [], null: false
    t.datetime "updated_at", null: false
    t.text "webhook_signing_secret"
    t.uuid "workspace_id"
    t.index ["provider_key", "environment"], name: "idx_on_provider_key_environment_fd0126d09e"
    t.index ["provider_key", "workspace_id", "environment"], name: "idx_orbit_connect_apps_workspace_env"
    t.index ["workspace_id"], name: "index_orbit_connect_provider_apps_on_workspace_id"
  end

  create_table "orbit_connect_sync_states", force: :cascade do |t|
    t.datetime "checkpoint_at"
    t.bigint "connection_id", null: false
    t.datetime "created_at", null: false
    t.string "cursor"
    t.jsonb "metadata", default: {}, null: false
    t.string "resource_name", null: false
    t.datetime "updated_at", null: false
    t.index ["connection_id", "resource_name"], name: "idx_orbit_connect_sync_states_unique", unique: true
    t.index ["connection_id"], name: "index_orbit_connect_sync_states_on_connection_id"
  end

  create_table "orbit_connect_webhook_events", force: :cascade do |t|
    t.integer "attempt_count", default: 0, null: false
    t.bigint "connection_id"
    t.datetime "created_at", null: false
    t.string "event_type"
    t.string "event_uid", null: false
    t.jsonb "headers", default: {}, null: false
    t.text "last_error"
    t.jsonb "payload", default: {}, null: false
    t.datetime "processed_at"
    t.string "provider_key", null: false
    t.datetime "received_at"
    t.string "signature"
    t.string "status", default: "received", null: false
    t.datetime "updated_at", null: false
    t.index ["connection_id"], name: "index_orbit_connect_webhook_events_on_connection_id"
    t.index ["provider_key", "event_uid"], name: "idx_orbit_connect_webhooks_uid", unique: true
    t.index ["status"], name: "index_orbit_connect_webhook_events_on_status"
  end

  create_table "workspaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "remote_id", null: false
    t.datetime "updated_at", null: false
    t.index ["remote_id"], name: "index_workspaces_on_remote_id", unique: true
  end

  add_foreign_key "ai_artifacts", "ai_runs"
  add_foreign_key "ai_artifacts", "conversations"
  add_foreign_key "ai_artifacts", "workspaces"
  add_foreign_key "ai_embedding_records", "workspaces"
  add_foreign_key "ai_runs", "conversations"
  add_foreign_key "ai_runs", "workspaces"
  add_foreign_key "attachments", "messages"
  add_foreign_key "contacts", "workspaces"
  add_foreign_key "conversations", "workspaces"
  add_foreign_key "messages", "conversations"
  add_foreign_key "orbit_connect_audit_logs", "orbit_connect_connections", column: "connection_id"
  add_foreign_key "orbit_connect_connection_attempts", "orbit_connect_connections", column: "connection_id"
  add_foreign_key "orbit_connect_connection_attempts", "orbit_connect_provider_apps", column: "provider_app_id"
  add_foreign_key "orbit_connect_connection_attempts", "workspaces"
  add_foreign_key "orbit_connect_connections", "orbit_connect_provider_apps", column: "provider_app_id"
  add_foreign_key "orbit_connect_connections", "workspaces"
  add_foreign_key "orbit_connect_credentials", "orbit_connect_connections", column: "connection_id"
  add_foreign_key "orbit_connect_provider_apps", "workspaces"
  add_foreign_key "orbit_connect_sync_states", "orbit_connect_connections", column: "connection_id"
  add_foreign_key "orbit_connect_webhook_events", "orbit_connect_connections", column: "connection_id"
end
