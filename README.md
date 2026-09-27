# Remix of Bloom Pregnancy Companion

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Bloom — Pregnancy Tracker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --rose: #D4537E;
    --rose-light: #FBEAF0;
    --rose-dark: #72243E;
    --rose-mid: #ED93B1;
    --teal: #1D9E75;
    --teal-light: #E1F5EE;
    --cream: #FDF9F6;
    --ink: #1a1018;
    --muted: #7a6872;
    --border: rgba(212,83,126,0.15);
    --white: #ffffff;
    --card: #ffffff;
    --radius: 16px;
    --radius-sm: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* PHONE SHELL */
  .phone-shell {
    width: 390px;
    min-height: 100vh;
    background: var(--cream);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* STATUS BAR */
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
  }

  /* SCREENS */
  .screen { display: none; flex: 1; flex-direction: column; overflow-y: auto; padding-bottom: 90px; }
  .screen.active { display: flex; }

  /* TOP BAR */
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px 8px;
  }
  .topbar-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--ink);
  }
  .topbar-sub { font-size: 13px; color: var(--muted); margin-top: 1px; }
  .icon-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--white);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: var(--rose);
    flex-shrink: 0;
  }

  /* HERO CARD */
  .hero {
    margin: 8px 16px 0;
    background: linear-gradient(135deg, #FBEAF0 0%, #F4C0D1 100%);
    border-radius: var(--radius);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    right: -20px; top: -20px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(212,83,126,0.08);
  }
  .hero-week-label { font-size: 12px; font-weight: 500; color: var(--rose); letter-spacing: 0.08em; text-transform: uppercase; }
  .hero-week-num {
    font-family: 'DM Serif Display', serif;
    font-size: 64px;
    color: var(--rose-dark);
    line-height: 1;
    margin: 2px 0 4px;
  }
  .hero-tagline { font-size: 14px; color: var(--rose-dark); font-style: italic; margin-bottom: 16px; }
  .hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .hero-stat {
    background: rgba(255,255,255,0.7);
    border-radius: var(--radius-sm);
    padding: 10px 8px;
    text-align: center;
  }
  .hero-stat-val { font-size: 16px; font-weight: 500; color: var(--rose-dark); }
  .hero-stat-label { font-size: 10px; color: var(--rose); margin-top: 2px; }

  /* SECTION */
  .section { padding: 16px 16px 0; }
  .section-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: var(--ink);
  }
  .section-link { font-size: 12px; color: var(--rose); cursor: pointer; }

  /* BABY CARD */
  .baby-card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 16px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .baby-fruit {
    font-size: 52px;
    width: 72px; height: 72px;
    background: var(--rose-light);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .baby-name { font-size: 15px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
  .baby-dims { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
  .baby-fact { font-size: 13px; color: var(--ink); line-height: 1.5; }

  /* TIP PILL */
  .tips-row { display: flex; flex-direction: column; gap: 8px; }
  .tip {
    background: var(--white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 12px 14px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink);
  }
  .tip-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }

  /* SHOP GRID */
  .category-scroll {
    display: flex;
    gap: 8px;
    padding: 0 16px 4px;
    overflow-x: auto;
  }
  .category-scroll::-webkit-scrollbar { display: none; }
  .cat-pill {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--white);
    color: var(--muted);
    transition: all 0.2s;
  }
  .cat-pill.active { background: var(--rose); color: white; border-color: var(--rose); }

  .prod-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px 16px 0;
  }
  .prod-card {
    background: var(--white);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .prod-card:active { transform: scale(0.97); }
  .prod-img {
    height: 100px;
    background: var(--rose-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
  }
  .prod-body { padding: 10px 10px 12px; }
  .prod-name { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
  .prod-price { font-size: 15px; font-weight: 500; color: var(--rose); }
  .prod-rating { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .prod-add {
    width: 28px; height: 28px;
    background: var(--rose);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-size: 18px;
    margin-top: 8px;
    cursor: pointer;
    border: none;
  }

  /* TRACKER */
  .week-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 4px;
    padding: 0 16px;
  }
  .wk {
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
    font-weight: 500;
    background: var(--white);
    border: 1px solid var(--border);
    color: var(--muted);
  }
  .wk.done { background: var(--rose-mid); border-color: var(--rose-mid); color: white; }
  .wk.current { background: var(--rose); border-color: var(--rose); color: white; font-weight: 700; }

  .log-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .log-card {
    background: var(--white);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .log-card:active { transform: scale(0.96); background: var(--rose-light); }
  .log-card-icon { font-size: 30px; margin-bottom: 6px; }
  .log-card-label { font-size: 13px; font-weight: 500; color: var(--ink); }

  /* CART */
  .cart-item {
    background: var(--white);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .cart-thumb {
    width: 52px; height: 52px;
    background: var(--rose-light);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
  }
  .cart-info { flex: 1; }
  .cart-name { font-size: 14px; font-weight: 500; color: var(--ink); }
  .cart-qty { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .cart-price { font-size: 15px; font-weight: 500; color: var(--rose); }
  .cart-footer {
    background: var(--white);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 16px;
  }
  .cart-total-row {
    display: flex; justify-content: space-between;
    font-size: 14px; margin-bottom: 8px;
    color: var(--muted);
  }
  .cart-total-row.bold { font-weight: 500; color: var(--ink); font-size: 16px; }
  .btn-primary {
    width: 100%;
    padding: 16px;
    background: var(--rose);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s;
  }
  .btn-primary:hover { background: var(--rose-dark); }

  /* PROFILE */
  .profile-hero {
    background: var(--rose-light);
    border-radius: var(--radius);
    padding: 20px;
    margin: 8px 16px 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .avatar {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: var(--rose);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: white;
    flex-shrink: 0;
  }
  .profile-name { font-size: 17px; font-weight: 500; color: var(--ink); }
  .profile-sub { font-size: 13px; color: var(--rose); margin-top: 2px; }
  .menu-list { padding: 8px 16px 0; }
  .menu-item {
    background: var(--white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--ink);
  }
  .menu-icon { font-size: 20px; color: var(--rose); width: 24px; text-align: center; }
  .menu-arrow { margin-left: auto; color: var(--muted); font-size: 16px; }

  /* BOTTOM NAV */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    width: 390px;
    background: rgba(253,249,246,0.95);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
    padding: 10px 0 20px;
    backdrop-filter: blur(10px);
    z-index: 100;
  }
  .nav-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 3px;
    cursor: pointer;
    padding: 0 12px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 500;
    border: none; background: none;
    transition: color 0.15s;
  }
  .nav-btn.active { color: var(--rose); }
  .nav-btn svg { width: 22px; height: 22px; }
  .nav-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--rose);
    margin: -2px auto 0;
  }

  /* BADGE */
  .badge {
    background: var(--rose);
    color: white;
    font-size: 10px;
    border-radius: 8px;
    padding: 1px 6px;
    margin-left: 4px;
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--ink);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
    white-space: nowrap;
    z-index: 200;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* AI CHAT OVERLAY */
  .ai-overlay {
    display: none;
    position: fixed;
    bottom: 0; left: 50%; transform: translateX(-50%);
    width: 390px;
    background: var(--white);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    border: 1px solid var(--border);
    padding: 20px;
    z-index: 300;
    max-height: 70vh;
    overflow-y: auto;
  }
  .ai-overlay.open { display: block; }
  .ai-handle { width: 36px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 16px; }
  .ai-msg { font-size: 14px; line-height: 1.6; color: var(--ink); }
  .ai-loading { color: var(--muted); font-style: italic; font-size: 13px; }
  .ai-input-row { display: flex; gap: 8px; margin-top: 14px; }
  .ai-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
    outline: none;
  }
  .ai-send {
    width: 40px; height: 40px;
    background: var(--rose);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .ai-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 299;
  }
  .ai-backdrop.open { display: block; }

  /* SCROLL */
  .screen::-webkit-scrollbar { display: none; }

  /* ANIMATIONS */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .screen.active { animation: fadeIn 0.25s ease; }

  @media (max-width: 420px) {
    .phone-shell, .bottom-nav { width: 100%; }
  }







    9:41
    🌸 Bloom
    ⬛⬛⬛ 100%



  


    


      


        

Good morning, Sarah 🌷


        

Week 20 · Halfway there!


      


      ✨
    



    


      

You are in week


      

20


      

You're halfway through your journey


      


        


          

2nd


          

Trimester


        


        


          

Nov 12


          

Due date


        


        


          

140


          

Days left


        


      


    



    


      


        

Baby this week


      


      


        

🍌


        


          

Size of a banana


          

16.4 cm · ~300g


          

Your baby can hear your voice and is developing eyebrows and eyelashes this week!


        


      


    



    


      


        

Today's tips


        

Ask AI ✨


      


      


        

💧Drink 8–10 glasses of water. Staying hydrated helps with common second-trimester symptoms.


        

🚶‍♀️A 20-minute walk boosts mood and circulation. Keep it gentle and comfortable.


        

🥗Focus on iron-rich foods today — leafy greens, lentils, and fortified cereals support your growing baby.


      


    



  


    


      

Shop


      ✨
    



    


      

All


      

Vitamins


      

Clothing


      

Skincare


      

Baby gear


    



    


      


        

💊


        


          

Prenatal vitamins


          

$24.99


          

⭐ 4.8 · 320 reviews


          +
        


      


      


        

👗


        


          

Maternity dress


          

$49.00


          

⭐ 4.6 · 180 reviews


          +
        


      


      


        

🧴


        


          

Belly oil


          

$18.50


          

⭐ 4.9 · 540 reviews


          +
        


      


      


        

🛏️


        


          

Nursing pillow


          

$39.95


          

⭐ 4.7 · 210 reviews


          +
        


      


      


        

🫐


        


          

DHA omega-3


          

$29.99


          

⭐ 4.7 · 412 reviews


          +
        


      


      


        

👖


        


          

Maternity jeans


          

$62.00


          

⭐ 4.5 · 97 reviews


          +
        


      


    



  


    


      

My journey


      ✨
    



    


      

Weeks


      


    



    


      

Log today


      


        


          

😊


          

Mood


        


        


          

🩺


          

Symptoms


        


        


          

⚖️


          

Weight


        


        


          

📸


          

Bump photo


        


        


          

🦵


          

Kick count


        


        


          

🏥


          

Appointment


        


      


    



  


    


      

My cart


      0 items
    


    


      


        

🛒


        Your cart is empty.
Head to the shop to add items!
      


    


    



  


    


      

Profile


      ⚙️
    


    


      

S


      


        

Sarah Johnson


        

Due Nov 12 · Week 20 · 2nd trimester


      


    


    


      

📅Appointments›


      

❤️Saved products3›


      

📦My orders›


      

👩‍👩‍👧Community›


      

🔔Notifications›


      

🔒Privacy & security›


      

✨Ask AI anything›


    



  
    
      
      Home
    
    
      
      Shop
    
    
      
      Tracker
    
    
      
      Cart 0
    
    
      
      Profile
    









Ask Bloom AI ✨

What would you like to know?


    
    ➤

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f47bd995-9765-4a17-991a-a6582880fd4d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
