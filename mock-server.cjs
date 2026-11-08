const http = require('http');

const PORT = process.env.PORT || 8000;

const SAMPLE_LOGS = [
  "  [!] outbound port 25 is blocked on this host - email verification and permutation are disabled (addresses stay unverified guesses)",
  "  [i] mail: 5 MX host(s) via Google Workspace",
  "  [*] discovering...",
  "  [-] Hunter.io: skipped (missing HUNTER_API_KEY)",
  "  [-] Apollo.io: skipped (missing APOLLO_API_KEY)",
  "  [-] Snov.io: skipped (missing SNOV_CLIENT_ID, SNOV_CLIENT_SECRET)",
  "  [-] Prospeo: skipped (missing PROSPEO_API_KEY)",
  "    github: matched org 'bamboobox' for bamboobox.ai",
  "  [+] PGP keyservers: 0 record(s)",
  "    search: 7 relevant result(s)",
  "  [+] Search dorks: 7 record(s)",
  "    github: 13 member(s) have no display name - kept as handle-only rows, no address guessed: @abhiram0806, @divyeshdixitb2, @gauravb2, @harsh-b2, @harshit-b2, @Khushi-c25, @nerellavishnuBb, @rahulpandey2704, @sandyptcb2, @seraj-b2, @Shabaaz-Raja, @Shubhankar-B2, +1 more",
  "  [+] GitHub: 22 record(s)",
  "    web: scanned 8 page(s), 0 candidate(s), 0 with LinkedIn profile",
  "    web: skipped 45 card(s) crediting another company (customer testimonials, not employees)",
  "  [+] Company website: 0 record(s)",
  "    linkedin: 10 query variant(s) x 3 page(s)",
  "    linkedin: 81 unique profile(s)",
  "  [i] linkedin: skipped 3 former-employee profile(s)",
  "  [i] linkedin: 67 named contact(s) queued for email resolution",
  "  [i] pattern: {first}{last} (1/1)",
  "  [!] pattern: only one confirming example, refusing to generate addresses",
  "  [*] linkedin: 5 person(s) without a profile URL",
  "  [*] linkedin: none=5"
];

// Sample rows from curl output
const SAMPLE_ROWS = [
  {
    domain: "bamboobox.ai",
    full_name: "Harsh Kumar Das",
    first_name: "Harsh",
    last_name: "das",
    title: "Gen AI @ Bamboobox.ai",
    email: "harshdas@bamboobox.ai",
    email_status: "unverified",
    confidence: 65,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/kdharsh24",
    linkedin_status: "current",
    github: "kdharshB2",
    website: "",
    sources: "github;linkedin;search",
    notes: "github: @kdharshB2; github company: Bamboobox; search[serper]; linkedin: headline names another company; linkedin: current (matched \"@ bamboobox.ai\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Amisha Sharma",
    first_name: "Amisha",
    last_name: "Sharma",
    title: "Associate SDE @ Bamboobox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/sharmaamisha",
    linkedin_status: "current",
    github: "AmishaSharma11",
    website: "",
    sources: "github;linkedin",
    notes: "github: @AmishaSharma11; github company: Bamboobox; linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Ankur Saigal",
    first_name: "Ankur",
    last_name: "Saigal",
    title: "Cofounder & CEO at BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/ankur-saigal-b35313",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"at bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Ishan Jain",
    first_name: "Ishan",
    last_name: "Jain",
    title: "Vice President of Growth",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/ishanjain125",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"building bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Khushi Thirwani",
    first_name: "Khushi",
    last_name: "Thirwani",
    title: "Growth Manager at BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/khushi-thirwani-94656024b",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"at bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Mohak Mahajan",
    first_name: "Mohak",
    last_name: "Mahajan",
    title: "Design at BambooBox.ai",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/mohakmahajan9",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin;search",
    notes: "search[serper]; linkedin: current (matched \"at bamboobox.ai\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Niharika Thakur",
    first_name: "Niharika",
    last_name: "Thakur",
    title: "Building BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/niharika-thakur-81a6911b9",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"building bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Pooja Joshi",
    first_name: "Pooja",
    last_name: "Joshi",
    title: "Software Engineer @ BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/pooja-joshi-7376b1166",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Prabhakar Swami",
    first_name: "Prabhakar",
    last_name: "Swami",
    title: "Demand Generation @ BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/prabhakar-swami",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Rani Kumari",
    first_name: "Rani",
    last_name: "Kumari",
    title: "DevOps Engineer @ BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/rani-kumari1316",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Roshan Borkar",
    first_name: "Roshan",
    last_name: "Borkar",
    title: "Product @ BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/roshanpborkar",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Srushti Patil",
    first_name: "Srushti",
    last_name: "Patil",
    title: "Customer Success Manager @ BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/srushti-patil-cs",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"@ bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Swagata Bhar",
    first_name: "Swagata",
    last_name: "Bhar",
    title: "Events & Community Host at BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/swagata-bhar",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"at bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Vanita Vasudevan",
    first_name: "Vanita",
    last_name: "Vasudevan",
    title: "VP at BambooBox",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/vanita-vasudevan-36698a322",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"at bamboobox\")"
  },
  {
    domain: "bamboobox.ai",
    full_name: "Vishal Gupta",
    first_name: "Vishal",
    last_name: "Gupta",
    title: "Building BambooBox. Hands on leader with ...",
    email: "",
    email_status: "name_only",
    confidence: 60,
    pattern: "",
    linkedin: "https://www.linkedin.com/in/vishalgupta2",
    linkedin_status: "current",
    github: "",
    website: "",
    sources: "linkedin",
    notes: "linkedin: current (matched \"building bamboobox. hands on leader with ...\")"
  }
];

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/scan' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let requestData = { domains: ['bamboobox.ai'], isVerify: true, isLinkedin: true };
      try {
        if (body) requestData = JSON.parse(body);
      } catch (e) {}

      const targetDomain = requestData.domains?.[0] || 'bamboobox.ai';

      res.writeHead(200, {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // 1. Send start event
      res.write(JSON.stringify({ type: 'start', domain: targetDomain }) + '\n');

      // 2. Stream log messages
      for (const log of SAMPLE_LOGS) {
        await new Promise(r => setTimeout(r, 60));
        res.write(JSON.stringify({ type: 'log', domain: targetDomain, message: log }) + '\n');
      }

      // 3. Send result event
      await new Promise(r => setTimeout(r, 100));
      const resultEvent = {
        type: 'result',
        domain: targetDomain,
        rows: SAMPLE_ROWS,
        meta: {
          domain: targetDomain,
          generated_at: new Date().toISOString(),
          elapsed_seconds: 3.2,
          total_records: SAMPLE_ROWS.length,
          with_email: 1,
          with_name: SAMPLE_ROWS.length,
          verified: 0,
          pattern: "{first}{last}",
          mail: {
            mx: ["aspmx.l.google.com"],
            providers: ["Google Workspace"],
            spf: true
          }
        },
        counts: {
          people: SAMPLE_ROWS.length,
          with_email: 1,
          verified: 0,
          with_linkedin: SAMPLE_ROWS.filter(r => r.linkedin).length
        },
        scanned_at: new Date().toISOString(),
        cached: false
      };
      res.write(JSON.stringify(resultEvent) + '\n');

      // 4. Send done event
      await new Promise(r => setTimeout(r, 80));
      res.write(JSON.stringify({ type: 'done', domains: requestData.domains?.length || 1, elapsed_ms: 3500 }) + '\n');
      res.end();
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock Contact Enrichment API running at http://localhost:${PORT}/api/scan`);
});

