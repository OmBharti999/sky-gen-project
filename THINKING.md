# THINKING

## 1. What assumptions did you make?
- I shifted all the data to prisma database, please check prisma/schema.prisma path for all the relations.
- I changed malformed date in you data to proper ISO format using my local time.
- I have added some new enums like DealStage, Segment, ActivityType, Industry -> note some names where changed like 'Closed Won' = ClosedWon as enums can't have space in between, and "Mid-Market" = MidMarket as this can't have dash in between.
- For Pipeline i have choosed condition -> not DealStage.ClosedWon, not DealStage.ClosedLost and created at is less than the passed quarter date.
- Your shared data was from Jan 2025 to Dec 2025, right while the financial year starts from March. I have named FINANCIAL_QUARTERS so you can check it starts from Q0 2025 and last one is Q4 2026 (which is empty as you don't provided data for that).
- I have added filter in header -> location top right side

## 2. What data issues did you find?
- The data was only available for single year, so we can't show the previous year revenue in the Last 6 months revenue trends. Please provide atleast 2 year data.
- It was not sorted, but that's fine — I moved the sorting to the database so we can use database-level operations.
- The timestamp data type (created at or closed at) was not in proper ISO format or Unix milliseconds, so it was malformed.

## 3. What tradeoffs did you choose?
- To ship quickly, I used only the provided data and requirements; no additional data was created.
- Used Prisma ORM over sql to ensure type safety and data persistence.
- Used Next Js as its offers fronted and backend both in single repo.
- Used server components for faster laod and build.
- Kept computations in-memory and synchronous for simplicity.
- Not intigrated AI for Recommendations and risk factor. So, the response from them is limited to a few items to stay actionable Please note not using AI generated propmts for risk factor and recommendation.

## 4. What would break at 10× scale?
- Long response may appear if date period is long.
- Aggregation queries (pipeline value, win rate) may slow down without indexing or query optimization.

## 5. What did AI help with vs what you decided?
- I was not aware about some terminolies like pipeline value, win rate, sales cycle=> so used ai to understant them.
- As you gave data for each table, after build model and relations(this done by me)=> I shared the schema file with ai, and asked how we can extract pipeline value, win rate, this helped to save some time of manual coding
- Used ai for building the services for fetching all the routes which you asked
- Never used D3 charts- so those charts are also created with help from AI 
- For top risk factor and recommendation response - Manually formatted template string are also created by AI
