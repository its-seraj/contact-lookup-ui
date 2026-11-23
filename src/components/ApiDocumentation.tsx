import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ApiDocumentationProps {
  onBackToConsole?: () => void;
}

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface ParamDef {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  default?: string | number | boolean;
  description: string;
}

interface EndpointDef {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  category: 'Authentication' | 'Enrichment' | 'Domain Cache' | 'System';
  authType: 'Bearer' | 'x-api-key' | 'none';
  params?: ParamDef[];
  requestBodyJson?: string;
  sampleResponseJson: string;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/$/, '') ||
  'https://its-seraj-contact-lookup.hf.space';

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'post-token',
    method: 'POST',
    path: '/api/token',
    summary: 'Generate or rotate API token',
    description:
      'Verify caller credentials and issue an Enrivo API token. Returns 201 when a new token is created, or 200 when an existing active token is returned.',
    category: 'Authentication',
    authType: 'Bearer',
    params: [
      {
        name: 'rotate',
        in: 'query',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Set to true to revoke the previous token and issue a new one.',
      },
    ],
    sampleResponseJson: JSON.stringify(
      {
        token: 'eh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
        created_at: '2026-11-23T07:45:00Z',
        user_email: 'user@example.com',
        scopes: ['scan:read', 'scan:write', 'domains:all'],
      },
      null,
      2
    ),
  },
  {
    id: 'get-token',
    method: 'GET',
    path: '/api/token',
    summary: 'Retrieve existing API token',
    description:
      'Returns the currently active API token associated with the signed-in caller without rotating or modifying it.',
    category: 'Authentication',
    authType: 'Bearer',
    sampleResponseJson: JSON.stringify(
      {
        token: 'eh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
        created_at: '2026-11-23T07:45:00Z',
        user_email: 'user@example.com',
      },
      null,
      2
    ),
  },
  {
    id: 'post-scan',
    method: 'POST',
    path: '/api/scan',
    summary: 'Waterfall contact discovery & mailbox verification',
    description:
      'Streams enriched contacts in real time. Discovers email candidates across corporate websites, matches verified LinkedIn employee profiles, builds permutation ladders, and performs direct MX mailbox handshakes.',
    category: 'Enrichment',
    authType: 'Bearer',
    params: [
      {
        name: 'format',
        in: 'query',
        type: 'string',
        required: false,
        default: 'ndjson',
        description: 'Streaming format: "ndjson" (line-delimited JSON) or "sse" (Server-Sent Events).',
      },
      {
        name: 'x-api-key',
        in: 'header',
        type: 'string',
        required: false,
        description: 'Alternative header for passing your API token instead of Bearer auth.',
      },
    ],
    requestBodyJson: JSON.stringify(
      {
        domains: ['stripe.com', 'linear.app'],
        isVerify: true,
        isLinkedin: true,
        permuteMax: 19,
        maxPages: 8,
        sweepVariants: 10,
        force: false,
      },
      null,
      2
    ),
    sampleResponseJson: JSON.stringify(
      {
        type: 'partial',
        domain: 'stripe.com',
        stage: 'direct-mx',
        rows: [
          {
            full_name: 'Patrick Collison',
            title: 'Chief Executive Officer',
            email: 'patrick@stripe.com',
            email_status: 'valid',
            domain: 'stripe.com',
            sources: 'website;linkedin-sweep;direct-mx',
            linkedin: 'https://linkedin.com/in/patrickcollison',
            confidence: 99,
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'get-domains',
    method: 'GET',
    path: '/api/domains',
    summary: 'List cached enriched domains',
    description:
      'Retrieves the list of target domains whose contact enrichment datasets are currently cached in the database.',
    category: 'Domain Cache',
    authType: 'Bearer',
    params: [
      {
        name: 'limit',
        in: 'query',
        type: 'integer',
        required: false,
        default: 200,
        description: 'Maximum number of cached domain entries to return (1 - 1000).',
      },
      {
        name: 'x-api-key',
        in: 'header',
        type: 'string',
        required: false,
        description: 'API key authorization header.',
      },
    ],
    sampleResponseJson: JSON.stringify(
      {
        total: 2,
        domains: [
          {
            domain: 'stripe.com',
            contacts_count: 84,
            scanned_at: '2026-11-23T06:20:12Z',
            is_verified: true,
          },
          {
            domain: 'linear.app',
            contacts_count: 36,
            scanned_at: '2026-11-23T05:14:45Z',
            is_verified: true,
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'get-domain-single',
    method: 'GET',
    path: '/api/domains/{domain}',
    summary: 'Retrieve cached results for a domain',
    description:
      'Fetches the complete cached roster of enriched contacts, deliverability statuses, and social links for a single target domain.',
    category: 'Domain Cache',
    authType: 'Bearer',
    params: [
      {
        name: 'domain',
        in: 'path',
        type: 'string',
        required: true,
        default: 'stripe.com',
        description: 'Target company domain name (e.g. stripe.com).',
      },
      {
        name: 'x-api-key',
        in: 'header',
        type: 'string',
        required: false,
        description: 'API key authorization header.',
      },
    ],
    sampleResponseJson: JSON.stringify(
      {
        domain: 'stripe.com',
        contacts_count: 84,
        contacts: [
          {
            full_name: 'Patrick Collison',
            title: 'Chief Executive Officer',
            email: 'patrick@stripe.com',
            email_status: 'valid',
            domain: 'stripe.com',
            linkedin: 'https://linkedin.com/in/patrickcollison',
            deliverability: '99.9%',
          },
        ],
        meta: {
          mx_records: ['mxa.mailgun.org', 'mxb.mailgun.org'],
          duration_ms: 1420,
        },
      },
      null,
      2
    ),
  },
  {
    id: 'delete-domain',
    method: 'DELETE',
    path: '/api/domains/{domain}',
    summary: 'Drop a cached domain',
    description:
      'Purges a cached domain and its stored contacts from the database to permit a fresh live re-scan.',
    category: 'Domain Cache',
    authType: 'Bearer',
    params: [
      {
        name: 'domain',
        in: 'path',
        type: 'string',
        required: true,
        default: 'stripe.com',
        description: 'Target domain name to delete from cache.',
      },
      {
        name: 'x-api-key',
        in: 'header',
        type: 'string',
        required: false,
        description: 'API key authorization header.',
      },
    ],
    sampleResponseJson: JSON.stringify(
      {
        status: 'deleted',
        domain: 'stripe.com',
        evicted_records: 84,
      },
      null,
      2
    ),
  },
  {
    id: 'get-health',
    method: 'GET',
    path: '/api/health',
    summary: 'Service health & connectivity check',
    description:
      'Verifies the health of the Enrivo enrichment service, active MongoDB connection status, and cluster capacities.',
    category: 'System',
    authType: 'none',
    sampleResponseJson: JSON.stringify(
      {
        status: 'ok',
        version: '1.0.0',
        cache: {
          enabled: true,
          from: 'MONGODB_URI',
          db: 'enrivo',
          collection: 'domains',
          error: '',
        },
        port25: null,
        max_domains_per_request: 10,
      },
      null,
      2
    ),
  },
];

export const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ onBackToConsole }) => {
  const { accessToken, user, isAuthenticated, triggerGoogleSignIn } = useAuth();

  // Active API token state directly from backend (backend is single source of truth)
  const [apiToken, setApiToken] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
  const [isTokenMasked, setIsTokenMasked] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tokenNotice, setTokenNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Interactive Try It Out state
  const [tryItOutId, setTryItOutId] = useState<string | null>(null);
  const [endpointParamValues, setEndpointParamValues] = useState<Record<string, Record<string, any>>>({});
  const [endpointBodyValues, setEndpointBodyValues] = useState<Record<string, string>>({});
  const [testResponses, setTestResponses] = useState<Record<string, { status: number; timeMs: number; data: any; error?: string }>>({});
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});

  // Backend Health Ping
  const [healthStatus, setHealthStatus] = useState<{ online: boolean; latencyMs: number } | null>(null);

  // Effective token to use in curls: ONLY the backend-verified API token, NEVER the JWT
  const effectiveToken = useMemo(() => {
    if (apiToken && apiToken.trim() && !apiToken.startsWith('eyJ')) {
      return apiToken.trim();
    }
    return 'YOUR_API_TOKEN';
  }, [apiToken]);

  // Clean any stale local tokens from previous sessions
  useEffect(() => {
    try {
      localStorage.removeItem('enrivo_api_token');
    } catch {}
  }, []);

  // Ping health on mount
  useEffect(() => {
    const start = performance.now();
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => {
        const latency = Math.round(performance.now() - start);
        if (res.ok) {
          setHealthStatus({ online: true, latencyMs: latency });
        } else {
          setHealthStatus({ online: false, latencyMs: latency });
        }
      })
      .catch(() => {
        setHealthStatus({ online: false, latencyMs: 0 });
      });
  }, []);

  // Fetch existing token unconditionally from backend on mount or when auth session changes
  const fetchExistingToken = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setApiToken('');
      setIsLoadingToken(false);
      return;
    }

    setIsLoadingToken(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/token`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const found =
          data?.token ||
          data?.api_key ||
          data?.key ||
          (typeof data === 'string' ? data : null);

        // Strict: only use if backend returned a genuine token, not a JWT
        if (found && typeof found === 'string' && !found.startsWith('eyJ')) {
          setApiToken(found);
        } else {
          setApiToken('');
        }
      } else {
        // 404 or other status code means no token exists on the backend
        setApiToken('');
      }
    } catch (err) {
      console.warn('Network error while checking existing API token from backend:', err);
      setApiToken('');
    } finally {
      setIsLoadingToken(false);
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    fetchExistingToken();
  }, [fetchExistingToken]);

  // Generate or Rotate Token handler - strictly communicates with backend
  const handleGenerateToken = async (rotate = false) => {
    if (!isAuthenticated) {
      triggerGoogleSignIn();
      return;
    }

    setIsGenerating(true);
    setTokenNotice(null);

    try {
      const url = `${API_BASE_URL}/api/token${rotate ? '?rotate=true' : ''}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok) {
        const token =
          data?.token ||
          data?.api_key ||
          data?.key ||
          (typeof data === 'string' && !data.startsWith('eyJ') ? data : null);

        if (token && typeof token === 'string' && !token.startsWith('eyJ')) {
          setApiToken(token);
          setTokenNotice({
            type: 'success',
            text: rotate ? 'API token rotated and renewed on backend!' : 'API token generated successfully on backend!',
          });
        } else {
          setApiToken('');
          setTokenNotice({
            type: 'error',
            text: 'Backend responded without a valid API token format.',
          });
        }
      } else {
        // Backend returned an error: do NOT create fake mock tokens!
        setApiToken('');
        setTokenNotice({
          type: 'error',
          text: data?.detail || `Backend returned status ${res.status}: Failed to generate token.`,
        });
      }
    } catch (err: any) {
      setApiToken('');
      setTokenNotice({
        type: 'error',
        text: err?.message || 'Network error connecting to backend token service.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate full cURL command for an endpoint
  const getCurlCommand = (ep: EndpointDef) => {
    const params = endpointParamValues[ep.id] || {};
    let url = `${API_BASE_URL}${ep.path}`;

    // Substitute path params
    if (ep.params) {
      ep.params
        .filter((p) => p.in === 'path')
        .forEach((p) => {
          const val = params[p.name] || p.default || 'stripe.com';
          url = url.replace(`{${p.name}}`, String(val));
        });
    }

    // Append query params
    const queryParts: string[] = [];
    if (ep.params) {
      ep.params
        .filter((p) => p.in === 'query')
        .forEach((p) => {
          const val = params[p.name] !== undefined ? params[p.name] : p.default;
          if (val !== undefined && val !== '') {
            queryParts.push(`${p.name}=${encodeURIComponent(String(val))}`);
          }
        });
    }
    if (queryParts.length > 0) {
      url += `?${queryParts.join('&')}`;
    }

    const lines: string[] = [`curl -X ${ep.method} "${url}"`];

    if (ep.authType === 'Bearer') {
      lines.push(`  -H "Authorization: Bearer ${effectiveToken}"`);
    }

    if (ep.requestBodyJson) {
      lines.push(`  -H "Content-Type: application/json"`);
      const body = endpointBodyValues[ep.id] || ep.requestBodyJson;
      lines.push(`  -d '${body.replace(/'/g, "\\'")}'`);
    }

    return lines.join(' \\\n');
  };

  // Interactive Execute Test
  const handleExecuteTest = async (ep: EndpointDef) => {
    setIsTesting((prev) => ({ ...prev, [ep.id]: true }));
    const startTime = performance.now();

    try {
      const params = endpointParamValues[ep.id] || {};
      let url = `${API_BASE_URL}${ep.path}`;

      // Path params
      if (ep.params) {
        ep.params
          .filter((p) => p.in === 'path')
          .forEach((p) => {
            const val = params[p.name] || p.default || 'stripe.com';
            url = url.replace(`{${p.name}}`, String(val));
          });
      }

      // Query params
      const queryParts: string[] = [];
      if (ep.params) {
        ep.params
          .filter((p) => p.in === 'query')
          .forEach((p) => {
            const val = params[p.name] !== undefined ? params[p.name] : p.default;
            if (val !== undefined && val !== '') {
              queryParts.push(`${p.name}=${encodeURIComponent(String(val))}`);
            }
          });
      }
      if (queryParts.length > 0) {
        url += `?${queryParts.join('&')}`;
      }

      const headers: Record<string, string> = {};
      if (ep.authType === 'Bearer') {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
      }

      let body: string | undefined;
      if (ep.requestBodyJson && ep.method !== 'GET') {
        headers['Content-Type'] = 'application/json';
        body = endpointBodyValues[ep.id] || ep.requestBodyJson;
      }

      const res = await fetch(url, {
        method: ep.method,
        headers,
        body,
      });

      const elapsed = Math.round(performance.now() - startTime);
      let data: any;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setTestResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: res.status,
          timeMs: elapsed,
          data,
        },
      }));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: 0,
          timeMs: elapsed,
          data: null,
          error: err.message || 'Request failed or blocked by CORS',
        },
      }));
    } finally {
      setIsTesting((prev) => ({ ...prev, [ep.id]: false }));
    }
  };

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return ENDPOINTS.filter((ep) => {
      const matchesCategory = activeCategory === 'All' || ep.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const categories = ['All', 'Authentication', 'Enrichment', 'Domain Cache', 'System'];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">terminal</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
                Enrivo REST API Documentation
              </h1>
              <span className="text-[10px] uppercase font-data-mono-sm px-2 py-0.5 rounded-full bg-primary text-on-primary font-semibold">
                v1.0.0
              </span>
            </div>
            <p className="font-body-sm text-xs text-secondary mt-0.5">
              Domain &rarr; People, Corporate Work Emails, and LinkedIn Profiles with Waterfall Enrichment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToConsole && (
            <button
              type="button"
              onClick={onBackToConsole}
              className="px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold border border-surface-container shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">arrow_back</span>
              <span>Back to Enrichment Console</span>
            </button>
          )}

          <a
            href="https://its-seraj-contact-lookup.hf.space/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface text-xs font-semibold border border-surface-container flex items-center gap-1.5 transition-colors"
            title="Open Swagger UI specification"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">open_in_new</span>
            <span>Swagger UI</span>
          </a>
        </div>
      </div>

      {/* API SPEC SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Base URL */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Base Endpoint</span>
            <span className="material-symbols-outlined text-[18px] text-primary">dns</span>
          </div>
          <div>
            <div className="flex items-center gap-2 font-data-mono-sm text-xs text-on-surface bg-surface-container-low p-2 rounded-xl border border-surface-container">
              <span className="truncate flex-1 font-semibold">{API_BASE_URL}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(API_BASE_URL, 'base-url')}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
                title="Copy Base URL"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedKey === 'base-url' ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-secondary mt-1">HTTPS enabled &bull; Global CDN &bull; NDJSON/SSE</p>
          </div>
        </div>

        {/* Card 2: Authentication Mode */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Authentication</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">key</span>
          </div>
          <div>
            <div className="font-data-mono-sm text-xs text-on-surface bg-surface-container-low p-2 rounded-xl border border-surface-container truncate">
              <span className="text-primary font-bold">Bearer</span> &lt;token&gt; or <span className="text-secondary font-semibold">x-api-key</span>
            </div>
            <p className="text-[11px] text-secondary mt-1">Pass in HTTP Header for all protected routes</p>
          </div>
        </div>

        {/* Card 3: Backend Health Status */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Service Status</span>
            <span className="material-symbols-outlined text-[18px] text-[#059669]">monitoring</span>
          </div>
          <div>
            <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus?.online ? 'bg-[#059669] animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-bold text-on-surface">
                {healthStatus?.online ? 'Online (200 OK)' : 'Connecting to cluster...'}
              </span>
              {healthStatus?.latencyMs ? (
                <span className="text-[11px] font-data-mono-sm text-secondary ml-auto">
                  {healthStatus.latencyMs}ms
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-secondary mt-1">MongoDB cluster &bull; Live waterfall resolver ready</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: TOKEN GENERATOR & CREDENTIAL MANAGER */}
      <section className="bg-gradient-to-r from-surface-container-lowest via-surface-container-low/40 to-surface-container-lowest border-2 border-primary/20 rounded-3xl p-6 sm:p-7 shadow-md space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>API Credential Vault</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">
              Personal API Token Generator
            </h2>
            <p className="text-xs text-secondary max-w-2xl leading-relaxed">
              Use your API token to authenticate cURL requests and programmatic integrations. Authenticate with{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface-container font-data-mono-sm text-primary">
                Authorization: Bearer &lt;token&gt;
              </code>{' '}
              or the{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface-container font-data-mono-sm text-primary">
                x-api-key: &lt;token&gt;
              </code>{' '}
              header.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerateToken(false)}
              disabled={isGenerating}
              className="h-10 px-4 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                  <span>{apiToken ? 'Generate New Token' : 'Generate Token'}</span>
                </>
              )}
            </button>

            {apiToken && (
              <button
                type="button"
                onClick={() => handleGenerateToken(true)}
                disabled={isGenerating}
                className="h-10 px-3.5 bg-surface-container-lowest hover:bg-surface-container text-secondary hover:text-on-surface font-semibold text-xs rounded-xl border border-surface-container transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Revoke current token and generate a fresh replacement"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Rotate</span>
              </button>
            )}
          </div>
        </div>

        {/* Token Feedback Alert */}
        {tokenNotice && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
              tokenNotice.type === 'success'
                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                : 'bg-error-container text-error border-error/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {tokenNotice.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{tokenNotice.text}</span>
          </div>
        )}

        {/* Token Display Field */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface">
                {apiToken ? 'Your Active API Token:' : 'API Token Status:'}
              </span>
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-secondary">
                    {isLoadingToken
                      ? 'Checking backend...'
                      : apiToken
                      ? `Tied to ${user?.email}`
                      : 'No token found in backend'}
                  </span>
                  <button
                    type="button"
                    onClick={fetchExistingToken}
                    disabled={isLoadingToken}
                    className="p-1 rounded-lg text-secondary hover:text-primary transition-colors cursor-pointer flex items-center"
                    title="Check backend API for active token"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${isLoadingToken ? 'animate-spin text-primary' : ''}`}>
                      sync
                    </span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Sign in required to generate personal token
                </span>
              )}
            </div>

            {apiToken ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTokenMasked(!isTokenMasked)}
                  className="text-xs text-secondary hover:text-on-surface flex items-center gap-1 cursor-pointer transition-colors"
                  title={isTokenMasked ? 'Reveal token' : 'Mask token'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isTokenMasked ? 'visibility' : 'visibility_off'}
                  </span>
                  <span>{isTokenMasked ? 'Reveal' : 'Mask'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(apiToken, 'active-token')}
                  className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-surface-container flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    {copiedKey === 'active-token' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedKey === 'active-token' ? 'Copied' : 'Copy Token'}</span>
                </button>
              </div>
            ) : null}
          </div>

          {isLoadingToken ? (
            <div className="bg-surface-container-low/70 px-4 py-3.5 rounded-xl border border-surface-container flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
                  progress_activity
                </span>
                <div>
                  <p className="text-xs font-semibold text-on-surface">Checking active tokens on backend...</p>
                  <p className="text-[11px] text-secondary">
                    Querying GET {API_BASE_URL}/api/token with your credentials
                  </p>
                </div>
              </div>
            </div>
          ) : apiToken ? (
            <div className="font-data-mono text-xs bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-surface-container break-all select-all flex items-center justify-between gap-3 text-primary font-bold">
              <span>
                {isTokenMasked
                  ? apiToken.substring(0, 8) + '•'.repeat(Math.max(16, apiToken.length - 12)) + apiToken.slice(-4)
                  : apiToken}
              </span>
            </div>
          ) : (
            <div className="bg-surface-container-low/70 px-4 py-3.5 rounded-xl border border-dashed border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">key_off</span>
                <div>
                  <p className="text-xs font-semibold text-on-surface">No API token found in backend</p>
                  <p className="text-[11px] text-secondary">
                    Click &quot;Generate Token&quot; above to create your API key on the server.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerateToken(false)}
                disabled={isGenerating}
                className="h-8 px-3.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">vpn_key</span>
                <span>Generate Token</span>
              </button>
            </div>
          )}

          <p className="text-[11px] text-secondary leading-normal">
            Keep your API token confidential. When generated, all cURL examples below automatically embed your active token.
          </p>
        </div>
      </section>

      {/* SECTION 2: ENDPOINT EXPLORER & CURL COMMANDS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface tracking-tight">
              API Endpoints &amp; cURL Commands
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Available REST endpoints from the official Swagger specification with interactive test runners.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container shadow-xs w-full sm:w-72">
            <span className="material-symbols-outlined text-[16px] text-secondary">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints..."
              className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder-secondary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-label-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-secondary hover:text-on-surface border border-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Endpoints List */}
        <div className="space-y-6">
          {filteredEndpoints.map((ep) => {
            const isTryOpen = tryItOutId === ep.id;
            const curlCode = getCurlCommand(ep);
            const testResult = testResponses[ep.id];
            const isCurrentlyTesting = Boolean(isTesting[ep.id]);

            return (
              <div
                key={ep.id}
                id={ep.id}
                className="bg-surface-container-lowest border border-surface-container rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Endpoint Header Bar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-low bg-surface-container-lowest">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Method Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-data-mono-sm tracking-wide ${
                        ep.method === 'POST'
                          ? 'bg-emerald-100 text-[#047857] border border-emerald-300'
                          : ep.method === 'DELETE'
                          ? 'bg-error-container text-error border border-error/20'
                          : 'bg-primary-fixed text-primary border border-primary/20'
                      }`}
                    >
                      {ep.method}
                    </span>

                    {/* Path */}
                    <span className="font-data-mono-sm text-sm font-bold text-on-surface">
                      {ep.path}
                    </span>

                    {/* Auth Requirement Badge */}
                    {ep.authType === 'Bearer' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-secondary border border-outline-variant">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                        <span>Auth Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-low text-secondary">
                        <span>Public</span>
                      </span>
                    )}

                    {/* Category */}
                    <span className="text-[11px] font-medium text-secondary">
                      &bull; {ep.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTryItOutId(isTryOpen ? null : ep.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isTryOpen
                          ? 'bg-primary-fixed text-primary border-primary/30 shadow-xs'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isTryOpen ? 'expand_less' : 'play_arrow'}
                      </span>
                      <span>{isTryOpen ? 'Hide Console' : 'Try it out'}</span>
                    </button>
                  </div>
                </div>

                {/* Endpoint Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Summary & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{ep.summary}</h3>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">
                      {ep.description}
                    </p>
                  </div>

                  {/* Parameters Table if any */}
                  {ep.params && ep.params.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary block">
                        Parameters:
                      </span>
                      <div className="overflow-x-auto rounded-xl border border-surface-container">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-surface-container-low text-secondary border-b border-surface-container">
                              <th className="py-2 px-3 font-semibold">Name</th>
                              <th className="py-2 px-3 font-semibold">In</th>
                              <th className="py-2 px-3 font-semibold">Type</th>
                              <th className="py-2 px-3 font-semibold">Required</th>
                              <th className="py-2 px-3 font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container-low font-data-mono-sm text-[11px]">
                            {ep.params.map((p) => (
                              <tr key={p.name} className="hover:bg-surface-container-low/40">
                                <td className="py-2 px-3 font-bold text-primary">{p.name}</td>
                                <td className="py-2 px-3 text-secondary">{p.in}</td>
                                <td className="py-2 px-3 text-secondary">{p.type}</td>
                                <td className="py-2 px-3">
                                  {p.required ? (
                                    <span className="text-error font-bold">Yes</span>
                                  ) : (
                                    <span className="text-secondary">No</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-body-md text-secondary">
                                  {p.description} {p.default !== undefined && `(Default: ${String(p.default)})`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* cURL Command Block */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">terminal</span>
                        <span>cURL Command</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(curlCode, `curl-${ep.id}`)}
                        className="h-7 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-semibold border border-surface-container flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          {copiedKey === `curl-${ep.id}` ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedKey === `curl-${ep.id}` ? 'Copied' : 'Copy cURL'}</span>
                      </button>
                    </div>

                    <div className="bg-[#0f172a] text-[#38bdf8] p-3.5 rounded-xl font-data-mono text-xs overflow-x-auto shadow-inner leading-relaxed border border-slate-800">
                      <pre className="whitespace-pre">{curlCode}</pre>
                    </div>
                  </div>

                  {/* Interactive Try-It-Out Panel */}
                  {isTryOpen && (
                    <div className="mt-4 p-4 rounded-xl bg-surface-container-low/60 border border-primary/20 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-surface-container pb-2">
                        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                          <span>Interactive Test Console</span>
                        </span>
                        <span className="text-[11px] text-secondary">Live API Request</span>
                      </div>

                      {/* Input fields for parameters */}
                      {ep.params && ep.params.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {ep.params.map((p) => {
                            const currentVal =
                              endpointParamValues[ep.id]?.[p.name] !== undefined
                                ? endpointParamValues[ep.id][p.name]
                                : p.default !== undefined
                                ? p.default
                                : '';

                            return (
                              <div key={p.name} className="space-y-1">
                                <label className="font-semibold text-secondary flex items-center gap-1">
                                  <span>{p.name}</span>
                                  <span className="text-[10px] text-secondary/60">({p.in})</span>
                                  {p.required && <span className="text-error">*</span>}
                                </label>
                                {p.type === 'boolean' ? (
                                  <select
                                    value={String(currentVal)}
                                    onChange={(e) => {
                                      const val = e.target.value === 'true';
                                      setEndpointParamValues((prev) => ({
                                        ...prev,
                                        [ep.id]: { ...(prev[ep.id] || {}), [p.name]: val },
                                      }));
                                    }}
                                    className="w-full bg-surface-container-lowest border border-surface-container rounded-lg p-2 text-xs text-on-surface focus:outline-none"
                                  >
                                    <option value="false">false</option>
                                    <option value="true">true</option>
                                  </select>
                                ) : (
                                  <input
                                    type={p.type === 'integer' ? 'number' : 'text'}
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = p.type === 'integer' ? Number(e.target.value) : e.target.value;
                                      setEndpointParamValues((prev) => ({
                                        ...prev,
                                        [ep.id]: { ...(prev[ep.id] || {}), [p.name]: val },
                                      }));
                                    }}
                                    placeholder={String(p.default || '')}
                                    className="w-full bg-surface-container-lowest border border-surface-container rounded-lg p-2 text-xs font-data-mono-sm text-on-surface focus:outline-none"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Request Body Editor if needed */}
                      {ep.requestBodyJson && (
                        <div className="space-y-1 text-xs">
                          <label className="font-semibold text-secondary">Request Body (JSON):</label>
                          <textarea
                            rows={6}
                            value={endpointBodyValues[ep.id] || ep.requestBodyJson}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEndpointBodyValues((prev) => ({ ...prev, [ep.id]: val }));
                            }}
                            className="w-full bg-surface-container-lowest border border-surface-container rounded-xl p-3 font-data-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}

                      {/* Execute Button */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleExecuteTest(ep)}
                          disabled={isCurrentlyTesting}
                          className="h-9 px-4 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCurrentlyTesting ? (
                            <>
                              <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                              </span>
                              <span>Sending Request...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">send</span>
                              <span>Send Request</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Live Response Panel */}
                      {testResult && (
                        <div className="mt-3 p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-surface-container pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold font-data-mono-sm ${
                                  testResult.status >= 200 && testResult.status < 300
                                    ? 'bg-emerald-100 text-[#047857]'
                                    : 'bg-error-container text-error'
                                }`}
                              >
                                {testResult.status || 'ERROR'}
                              </span>
                              <span className="text-secondary font-medium">
                                Response in {testResult.timeMs}ms
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  typeof testResult.data === 'object'
                                    ? JSON.stringify(testResult.data, null, 2)
                                    : String(testResult.data),
                                  `res-${ep.id}`
                                )
                              }
                              className="text-secondary hover:text-on-surface flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedKey === `res-${ep.id}` ? 'check' : 'content_copy'}
                              </span>
                              <span className="text-[11px]">Copy Response</span>
                            </button>
                          </div>

                          <div className="max-h-64 overflow-y-auto bg-surface-container-low p-3 rounded-lg font-data-mono text-[11px] text-on-surface">
                            <pre className="whitespace-pre-wrap">
                              {testResult.error
                                ? `Error: ${testResult.error}`
                                : typeof testResult.data === 'object'
                                ? JSON.stringify(testResult.data, null, 2)
                                : String(testResult.data)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sample Expected Response Collapsible Preview */}
                  <details className="group pt-1">
                    <summary className="text-[11px] font-semibold text-secondary hover:text-on-surface cursor-pointer select-none flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] group-open:rotate-90 transition-transform">
                        chevron_right
                      </span>
                      <span>Sample 200 OK Response Schema</span>
                    </summary>
                    <div className="mt-2 bg-surface-container-low p-3 rounded-xl font-data-mono text-[11px] text-secondary overflow-x-auto border border-surface-container">
                      <pre className="whitespace-pre">{ep.sampleResponseJson}</pre>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-surface-container text-center text-xs text-secondary space-y-1">
        <p>
          Need client SDKs or higher concurrency? Reach out to support or visit the{' '}
          <a
            href="https://its-seraj-contact-lookup.hf.space/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold"
          >
            official Swagger interface
          </a>
          .
        </p>
        <p>&copy; 2026 Enrivo Technologies Inc. Enrivo API specification.</p>
      </footer>
    </div>
  );
};

export default ApiDocumentation;
