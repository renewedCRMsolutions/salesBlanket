# Website Integration Tables

Let's add tables specifically designed for website integration:
sql-- Website visitor tracking
CREATE TABLE website_visits (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
session_id UUID NOT NULL,
visitor_id VARCHAR(100),
first_visit BOOLEAN DEFAULT TRUE,
landing_page VARCHAR(255),
referrer VARCHAR(255),
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
ip_address VARCHAR(50),
user_agent TEXT,
visit_start TIMESTAMPTZ DEFAULT now(),
visit_end TIMESTAMPTZ,
pages_viewed INTEGER DEFAULT 1,
conversion_status VARCHAR(50),
device_data JSONB,
geo_data JSONB,
behavior_metrics JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Website event tracking
CREATE TABLE website_events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
session_id UUID NOT NULL,
event_type VARCHAR(100) NOT NULL,
event_category VARCHAR(100),
event_action VARCHAR(100),
event_label VARCHAR(255),
event_value INTEGER,
page_url VARCHAR(255),
occurred_at TIMESTAMPTZ DEFAULT now(),
event_data JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Create appropriate indexes
CREATE INDEX idx_website_visits_session ON website_visits(session_id);
CREATE INDEX idx_website_visits_visitor ON website_visits(visitor_id);
CREATE INDEX idx_website_events_session ON website_events(session_id);
CREATE INDEX idx_website_events_type ON website_events(event_type);
CREATE INDEX idx_website_events_category ON website_events(event_category, event_action);
CREATE INDEX idx_website_events_data ON website_events USING GIN (event_data);
These tables will help you track visitor behavior across your website and mobile app, with seamless integration between the two platforms.
For JSONB fields that will be frequently queried, GIN indexes are recommended for complex data structures, while B-tree indexes are better for general-purpose indexing when exact matches are needed. Metisdata
Would you like me to incorporate these tables into the complete schema creation script, or would you prefer to add them separately? This approach will give you robust tracking capabilities while maintaining high performance through proper indexing.
