import { Helmet } from 'react-helmet-async';
import { useTenant } from '../contexts/TenantContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  schema?: object;
}

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  schema,
}: SEOHeadProps) {
  const { tenant } = useTenant();
  const siteName = tenant?.seo_defaults?.site_name ?? 'Blog Platform';
  const twitterHandle = (tenant?.seo_defaults?.twitter_handle as string) ?? '@blogplatform';

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const ogImage = image ?? '/og-default.jpg';

  const articleSchema = schema ?? (type === 'article'
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: ogImage,
        url: canonicalUrl,
        datePublished: publishedTime,
        author: { '@type': 'Person', name: author },
        publisher: { '@type': 'Organization', name: siteName },
      }
    : null);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
}
