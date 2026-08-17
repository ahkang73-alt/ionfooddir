# 🎀 Linda's ION Orchard Dining Directory 🎀

A cute Hello Kitty-themed restaurant finder for ION Orchard, Singapore.

**Created by:** Linda Kang  
**Contact:** [WhatsApp](https://wa.me/6585112574)

## Features ✨

- 🔍 **Search by Restaurant Name** - Find your favorite place instantly
- 🍽️ **Filter by Cuisine Type** - Asian, Chinese, Japanese, Korean, Italian, Seafood, Cafe
- 💰 **Filter by Price Range** - From budget-friendly to fine dining
- ⭐ **Google Reviews Integration** - See ratings and review counts
- 🗺️ **Google Maps Links** - Navigate directly to each restaurant
- 📞 **Reservation Button** - Contact info for bookings
- 🎲 **Surprise Me Randomizer** - Can't decide? Let fate choose!
- 📱 **Fully Responsive** - Works beautifully on mobile, tablet, and desktop

## Quick Start 🚀

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/linda-ion-food-directory.git
   cd linda-ion-food-directory
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser, or
   - Use Python's built-in server:
     ```bash
     python -m http.server 3000
     ```
   - Then visit `http://localhost:3000`

## Deploy to Vercel 🌐

### Option 1: Via GitHub (Recommended)

1. **Create a GitHub account** (if you don't have one)
   - Go to [github.com](https://github.com) and sign up

2. **Create a new GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it: `linda-ion-food-directory`
   - Click "Create repository"

3. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Linda's ION Orchard Food Directory"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/linda-ion-food-directory.git
   git push -u origin main
   ```

4. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login (can use GitHub account)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"
   - Vercel will auto-detect settings
   - Click "Deploy"
   - Done! Your site is live! 🎉

### Option 2: Direct Vercel Upload

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login
3. Click "Upload" instead of "Import"
4. Drag and drop this folder
5. Deploy!

## Customization 🎨

### Add More Restaurants

Edit the `restaurants` array in `index.html` (around line 400):

```javascript
const restaurants = [
    {
        id: 1,
        name: "Restaurant Name",
        cuisine: "Cuisine Type",
        price: "$",           // $, $$, $$$, or $$$$
        location: "Location",
        rating: 4.5,
        reviews: 280,
        emoji: "🍜"
    },
    // Add more restaurants here...
];
```

### Change Colors/Theme

Look for color values in the CSS section (starts around line 15):
- Pink primary: `#ff1493`
- Light pink: `#ffb6d9`
- Background: `#fff0f5`

Replace with your preferred colors!

### Update Font

Find `font-family: 'Comic Sans MS'` and change to any Google Font or system font.

## Features Explained 📖

### Search & Filters
- **Name Search**: Real-time search as you type
- **Cuisine Filter**: Multi-select checkboxes for food types
- **Price Filter**: Choose your budget level
- **Clear All**: Reset all filters instantly

### Restaurant Cards
- **Emoji Icon**: Food-related emoji for quick visual reference
- **Ratings**: Google review ratings and review count
- **Location**: Where in ION Orchard it's located
- **Price Range**: Visual price indicator
- **Reserve Button**: Quick access to make reservations
- **Maps Button**: Open in Google Maps

### Surprise Me! 🎲
- Randomizes from filtered or all restaurants
- Shows beautiful animated popup
- Links directly to Google Maps

## Requirements ✅

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Google Maps and reviews)
- No installation needed - it's just HTML!

## File Structure 📁

```
linda-ion-food-directory/
├── index.html           # Main application file
├── vercel.json          # Vercel configuration
├── package.json         # Project metadata
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── .git/                # GitHub repository (after pushing)
```

## Troubleshooting 🔧

**Q: The maps links aren't working**
- A: Make sure you have internet connection. Links open in new tab.

**Q: Filters aren't working**
- A: Clear browser cache and refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Q: Can't deploy to Vercel**
- A: Make sure you pushed to GitHub first, and your repository is public

**Q: Want to add reservations feature**
- A: You can integrate with:
  - Google Maps booking
  - Resy API
  - Chope
  - Feastbox

## Contact & Support 💬

Created with 💕 by **Linda Kang**

- WhatsApp: [wa.me/6585112574](https://wa.me/6585112574)
- Email: ahkang73@yahoo.com.sg

## License 📄

MIT License - Feel free to use, modify, and share!

---

**Happy Dining! 🍽️✨**
