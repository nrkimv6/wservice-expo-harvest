Please design a mobile web app UI for "Exhibition Loot Farming Tracker". 
This app is for attendees who want to efficiently collect freebies, giveaways, and time-limited event prizes at exhibition booths. 

Do not worry about the tech stack, routing, or exact positioning. Please decide the best mobile-first layout, typography, and spacing yourself. Focus on providing the following elements and their states.

**[App Vibe & Reference]**
- Vibe: Gamified utility, highly readable, action-oriented, fast to scan.
- Reference: Sneaker drop apps (SNKRS), Todoist, Notion (for clean memos). 
- Key UX: Users are walking in a crowded hall, so elements should be thumb-friendly and status (Done/Todo) must be highly visible.

**[Core UI Elements to Include]**

1. Global Real-time Alert Banner
- Type: Notice Banner / Ticker
- Properties: Read-only text, high visibility (attention-grabbing).
- Data: "X minutes left until [Booth Name] Roulette event!"

2. Map & Marker Component
- Type: Interactive Image Area with Overlaid Pins
- Elements: 
  - Map image container (supports zoom/pan interactions conceptually).
  - Map Pins (Markers).
- Properties (Pin States): 
  - 'Default' (Event available)
  - 'Bookmarked' (User wants to go)
  - 'Completed' (Farmed, should look disabled/dimmed).

3. Loot (Event) Feed List
- Type: Feed / List View
- Elements inside each List Item:
  - Time Indicator (e.g., "14:00" or "Always")
  - Booth Name (Text)
  - Prize Description (Text, Highlighted)
  - Status Toggle (Checkbox or Button: Done/Undone)
- Controls:
  - Search Input: Free text typing.
  - Filter Chips/Tags: Multi-select, limited options (e.g., "Time Attack", "Instagram", "App Install", "Survey").

4. Booth Detail & Action Card
- Type: Content Card / Sheet (Let AI decide how to display)
- Elements:
  - Booth & Event Info: Read-only text (Title, Location, Prize, Mission conditions).
  - User Memo: Free text input area (Textarea) for personal tips.
  - Action Controls: 
    - Bookmark Toggle (Boolean: On/Off)
    - Completion Status Toggle (Boolean: Farmed/Not Farmed)