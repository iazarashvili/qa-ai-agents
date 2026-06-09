# QA Agent System - გამოყენების ინსტრუქცია

## გაშვება

```bash
cd dashboard
npm run dev
```

გახსენი http://localhost:3000

## წინაპირობები

1. **Claude CLI** დაინსტალირებული უნდა იყოს (`claude` ბრძანება ტერმინალში)
2. **`.env.local`** ფაილი `dashboard/` საქაღალდეში შემდეგი ცვლადებით:
   - `QASE_TOKEN` — Qase.io API ტოკენი
   - `SPORT_USERNAME` / `SPORT_USER_PASSWORD` — საიტის კრედენშიალები
3. **Project Path** — dashboard-ის header-ში მიუთითე ტესტ-პროექტის path (მაგ. `C:\iLoOoo\playwright-project`)

---

## საქაღალდეების სტრუქტურა

```
qa-ai-agents/
├── dashboard/                  # Next.js dashboard აპლიკაცია
├── automatization-tests/       # აგენტების prompt ფაილები (.md)
├── agents-data/                # აგენტების მიერ დაგენერირებული ფაილები
│   ├── qase-io-agent/          # Qase IO Agent-ის output
│   │   ├── manual_output.json
│   │   └── screens/            # Qase-დან ჩამოტვირთული სქრინშოტები
│   ├── full-flow-agent/        # Full Flow Agent-ის output
│   │   └── manual_output.json
│   └── manual-qa-agent/        # Manual QA Agent-ის output
│       └── cases.json
└── agents-help-data/           # Manual QA-სთვის წინასწარ მომზადებული მასალა
    ├── screenshots/            # გვერდის სქრინშოტები (.png, .jpg)
    └── html-sources/           # გვერდის HTML კოდი (.html)
```

---

## აგენტები

### 1. Qase IO Agent

Qase.io-დან ტესტ ქეისების წამოღება, საიტზე სელექტორების აღმოჩენა და `manual_output.json`-ის გენერირება.

**როდის გამოიყენო:** როცა Qase.io-ზე უკვე გაქვს ტესტ ქეისები და გინდა ავტომატიზაცია.

**Input:**
- `WSP-2314` ან `suite_id=123` — Qase.io-დან ქეისის წამოსაღებად
- ცარიელი + **Cases JSON File** path — თუ Manual QA-ს `cases.json` გამოიყენებ input-ად

**Output:** `agents-data/qase-io-agent/manual_output.json` + სქრინშოტები `screens/`-ში

**რას აკეთებს:**
1. Qase.io API-დან (ან JSON ფაილიდან) ქეისებს კითხულობს
2. საიტზე ავტორიზდება
3. DOM-ში სელექტორებს პოულობს (`data-cy`, `aria-*`, CSS)
4. API endpoint-ებს აღმოაჩენს
5. ქართულ ტექსტებს იწერს
6. Qase-ის ყველა სტეპის სქრინშოტს ჩამოტვირთავს `screens/`-ში

---

### 2. Write Test Agent

`manual_output.json`-ის მიხედვით Playwright ტესტის კოდის გენერაცია (locators, pages, spec).

**როდის გამოიყენო:** Qase IO Agent-ის შემდეგ, როცა `manual_output.json` მზადაა.

**Input:**
- `WSP-2314` ან ცარიელი (ავტომატურად წაიკითხავს `manual_output.json`-ს)
- **File Paths** (არასავალდებულო) — თუ უკვე არსებულ ფაილებს ამატებ:
  - `Test File` — `tests/pre-match/timeFilter.spec.ts`
  - `Locators File` — `locators/pre-match/timeFilterLocators.ts`
  - `Page Object File` — `pages/pre-match/timeFilterPage.ts`

**Output:** ტესტ ფაილები პირდაპირ პროექტში (Project Path)

**რას აკეთებს:**
1. კითხულობს `agents-data/qase-io-agent/manual_output.json`-ს
2. ნახავს Qase-ის სქრინშოტებს (`screens/`) ელემენტების იდენტიფიცირებისთვის
3. ამოწმებს არსებულ სელექტორებს/მეთოდებს — დუბლიკატს არ ქმნის
4. ქმნის locators, page objects, test spec ფაილებს

---

### 3. Fix Test Agent

წარუმატებელი ტესტების ანალიზი და გასწორება.

**როდის გამოიყენო:** როცა ტესტი ფეილდება და გინდა ავტომატურად გასწორდეს.

**Input:**
- `WSP-2314` — WSP ID
- `tests/pre-match/games.spec.ts` — კონკრეტული ფაილი
- ან error output — შეცდომის ტექსტი

**Output:** გასწორებული ფაილები პროექტში

**რას აკეთებს:**
1. შეცდომას აანალიზებს
2. კოდს კითხულობს და ესმის
3. დიაგნოზს სვამს (სელექტორი შეიცვალა? ლოგიკა? timing?)
4. ასწორებს
5. ვერიფიცირებს

---

### 4. Full Flow Agent

სრული ფლოუ — Qase IO + Write Test ერთ ნაბიჯში.

**როდის გამოიყენო:** როცა გინდა ერთი ღილაკით Qase ქეისიდან მზა ტესტამდე მიხვიდე.

**Input:** `WSP-2314, WSP-2315` — WSP ID(ები)

**Output:** `agents-data/full-flow-agent/manual_output.json` + ტესტ ფაილები პროექტში

**რას აკეთებს:**
1. Stage 1: Qase-დან ქეისებს კითხულობს, სელექტორებს პოულობს
2. Stage 2: ტესტის კოდს აგენერირებს

---

### 5. Manual QA

გვერდის ანალიზი და ოპტიმიზირებული ტესტ ქეისების გენერაცია (EP, BVA, State Transition, Error Guessing).

**როდის გამოიყენო:** როცა ახალი გვერდი/ფიჩერი გაქვს და ტესტ ქეისების დაწერა გინდა.

**Input:**
- **Feature Name** (სავალდებულო) — `Registration Page`, `Login Modal`...
- **Page URL** — გვერდის მისამართი
- **Screenshot Path** — სქრინშოტის path
- **HTML File Path** — HTML ფაილის path

**ავტო-აღმოჩენა:** აგენტი ავტომატურად ამოწმებს `agents-help-data/` საქაღალდეს:
- `agents-help-data/screenshots/` — თუ სქრინშოტია, წაიკითხავს
- `agents-help-data/html-sources/` — თუ HTML ფაილია, წაიკითხავს

ანუ შეგიძლია უბრალოდ ჩააგდო ფაილები ამ საქაღალდეებში და აგენტი თვითონ იპოვის.

**Output:** `agents-data/manual-qa-agent/cases.json`

**რას აკეთებს:**
1. სქრინშოტს/HTML-ს/URL-ს აანალიზებს
2. გვერდის ტიპს ადგენს (ფორმა, დეშბორდი, e-commerce...)
3. ტესტ დიზაინის ტექნიკებს იყენებს
4. 20-35 ოპტიმიზირებულ ტესტ ქეისს აგენერირებს
5. `cases.json` ქმნის

---

## ტიპიური workflow-ები

### Workflow A: Qase.io → ავტომატური ტესტი
```
1. Qase IO Agent  (WSP-2314)     → agents-data/qase-io-agent/manual_output.json
2. Write Test Agent               → პროექტში ტესტ ფაილები
3. Fix Test Agent (თუ ფეილდება)   → გასწორებული ფაილები
```

### Workflow B: ახალი გვერდი → ქეისები → ტესტი
```
1. Manual QA (+ სქრინშოტი/HTML)  → agents-data/manual-qa-agent/cases.json
2. Qase IO Agent (cases.json)     → agents-data/qase-io-agent/manual_output.json
3. Write Test Agent               → პროექტში ტესტ ფაილები
```

### Workflow C: სწრაფი (ერთ ნაბიჯში)
```
1. Full Flow Agent (WSP-2314)     → manual_output.json + ტესტ ფაილები
```

---

## Dashboard-ის ტაბები

| ტაბი | რას აჩვენებს |
|------|-------------|
| **Logs** | აგენტის რეალურ დროში ლოგები |
| **Browser** | ბრაუზერის სქრინშოტები (Playwright MCP) |
| **Thinking** | აგენტის ფიქრის პროცესი — რა ფაილს კითხულობს, რას წერს |
| **Files** | შეცვლილი/შექმნილი ფაილების სია |
| **Flow** | აგენტის ფაზების პროგრესი |
