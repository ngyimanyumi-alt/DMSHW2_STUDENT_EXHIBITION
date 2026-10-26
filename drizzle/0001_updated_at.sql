CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = clock_timestamp();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER exhibition_card_overrides_updated_at
BEFORE UPDATE ON "exhibition_card_overrides"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER exhibition_settings_updated_at
BEFORE UPDATE ON "exhibition_settings"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();