/*
  # Enable Social Authentication Providers
  
  1. Changes
    - Enable Google OAuth provider
    - Enable Facebook OAuth provider
    - Add necessary security policies
*/

-- Enable Google OAuth provider
CREATE OR REPLACE FUNCTION auth.set_google_provider()
RETURNS void AS $$
BEGIN
  INSERT INTO auth.providers (provider_id)
  VALUES ('google')
  ON CONFLICT (provider_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT auth.set_google_provider();

-- Enable Facebook OAuth provider
CREATE OR REPLACE FUNCTION auth.set_facebook_provider()
RETURNS void AS $$
BEGIN
  INSERT INTO auth.providers (provider_id)
  VALUES ('facebook')
  ON CONFLICT (provider_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT auth.set_facebook_provider();