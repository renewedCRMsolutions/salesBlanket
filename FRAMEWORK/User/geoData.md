# Enhanced User Activity Tracking Schema

Let's create a robust user tracking system that captures IP addresses, user agents, and detailed analytics while maintaining performance:
sql-- Activity tracking table with comprehensive metadata
CREATE TABLE user_activity_logs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id),
session_id UUID,
entity_id UUID,
entity_type VARCHAR(100),
action VARCHAR(100) NOT NULL,
occurred_at TIMESTAMPTZ DEFAULT now(),
ip_address VARCHAR(50),
user_agent TEXT,
device_info JSONB,
geo_location JSONB,
request_details JSONB,
context_data JSONB,
performance_metrics JSONB
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_action ON user_activity_logs(action);
CREATE INDEX idx_user_activity_occurred_at ON user_activity_logs(occurred_at);
CREATE INDEX idx_user_activity_entity ON user_activity_logs(entity_id, entity_type);
CREATE INDEX idx_user_activity_ip ON user_activity_logs(ip_address);
-- GIN index for JSONB fields to enable efficient querying
CREATE INDEX idx_user_activity_device_info ON user_activity_logs USING GIN (device_info);
CREATE INDEX idx_user_activity_context_data ON user_activity_logs USING GIN (context_data);
The JSONB fields allow flexible data collection without schema rigidity:

device_info: Store browser, OS, screen resolution, etc.
geo_location: Store coordinates, country, city, etc.
request_details: Store HTTP method, endpoint, query parameters
context_data: Store action-specific data (what button was clicked, what filter was applied)
performance_metrics: Store page load time, API response time, etc.

For JSONB columns that will contain millions of entries, using compact key names like "pb" instead of "publisherName" can significantly improve storage efficiency. ScaleGrid This is especially important for high-volume tracking data.
We should also implement "partial indexes" for common query patterns, such as active users, which can improve query performance for specific use cases. Speak Data Science
