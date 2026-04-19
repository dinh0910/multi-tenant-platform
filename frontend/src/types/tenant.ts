export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  theme_config: {
    primary_color?: string;
    font?: string;
    [key: string]: unknown;
  };
  seo_defaults: {
    site_name?: string;
    twitter_handle?: string;
    [key: string]: unknown;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
