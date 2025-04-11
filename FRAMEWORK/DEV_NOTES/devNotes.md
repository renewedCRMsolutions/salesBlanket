# Dev Notes

For efficient data propagation across these tracking tables:

Consider Table Partitioning

For high-volume tables like activity_log and user_analytics, consider partitioning by date
This keeps queries fast when you only need recent data

Implement Archiving Strategies

Move older tracking data to archive tables
Use materialized views for reporting on historical data

Use Triggers for Automated Tracking

Create triggers that automatically create activity records when main entities change
Example:
sqlCREATE OR REPLACE FUNCTION log_entity_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO entity_events (
    entity_id, entity_type_id, action, 
    performed_by, previous_state, new_state
  ) VALUES (
    NEW.id, TG_ARGV[0], TG_OP, 
    current_setting('app.current_user_id', true)::uuid,
    CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

Data Propagation Flow

Implement clear rules for how data flows from one tracking system to another
Example flow:

User action → activity_log
Entity change → entity_events
Achievement criteria met → entity_achievements
Goal progress → goal_events

Consider a Time-Series Database

For the most granular tracking data, consider using a dedicated time-series database like TimescaleDB (PostgreSQL extension)
This is especially helpful for website analytics and performance metrics

Recommendations for Streamlining

Consolidate Similar Tables:

Consider if activity_log and user_analytics could be combined
Evaluate if all the card pulse tables need to be separate

Use JSON/JSONB Wisely:

Your schema already uses JSONB for metadata
Consider storing infrequently accessed tracking details in JSONB fields rather than separate columns

Implement Retention Policies:

Define how long each type of tracking data needs to be kept
Automate purging of old data to keep tables performant

Optimize for Read vs. Write:

Most tracking tables are write-heavy but read-seldom
Consider disabling some indexes on these tables, only adding them when needed for reports