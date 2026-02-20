# Swift Ahmedabad - Bento Grid Page

A beautiful bento-style landing page for the Swift Ahmedabad community, featuring links to all social platforms and community resources.

## 🚀 Getting Started

### Setup GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings** > **Pages** in your repository
3. Under "Source", select **GitHub Actions**
4. The site will be deployed automatically on every push to `main` or `master`

### Manual Setup (Alternative)

1. Go to **Settings** > **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select `main` or `master` branch and `/ (root)` folder
4. Click **Save**

## 🎨 Features

- **Bento Grid Layout**: Modern, responsive grid design
- **Dark Theme**: Sleek black background with vibrant hover effects
- **Official Icons**: All social media icons are official SVG versions
- **Fully Responsive**: Optimized for desktop, tablet, and mobile
- **Animations**: Smooth hover effects and transitions
- **Accessibility**: ARIA labels and semantic HTML
- **JSON-Driven Content**: Easy to update links without editing HTML
- **Sticky Navigation Bar**: Full-width sticky navbar with logo and contact button

## 📝 Updating Content

All content is stored in `links.json`. To make changes:

### Update Community Info

```json
"community": {
  "name": "Swift Ahmedabad",
  "tagline": "Building the Swift developer community in Ahmedabad",
  "logo": "assets/swiftAhmedabad.jpg",
  "email": "contact@swiftahmedabad.com"
}
```

- `name`: Community name shown in header and page title
- `tagline`: Subtitle under the community name
- `logo`: Path to your logo image
- `email`: Contact email for the "Contact Us" button in the navbar

### Update Social Links

Modify existing links or add new ones following this structure:

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "description": "Short description",
  "url": "https://example.com",
  "icon": "icon-name",
  "color": "#HEXCODE"
}
```

### Available Icons
- `twitter`, `linkedin`, `luma`, `whatsapp`, `instagram`, `aratt`, `discord`, `maps`

### For Map Locations
Add `"isMap": true` and include a `mapUrl` with the embed URL from Google Maps.

### Example - Adding a New Link
```json
{
  "id": "youtube",
  "name": "YouTube",
  "description": "Watch our videos",
  "url": "https://youtube.com/swiftahmedabad",
  "icon": "youtube",
  "color": "#FF0000"
}
```

3. Save the file and commit to deploy changes automatically!

## 📱 Social Links

- **X (Twitter)**: https://twitter.com/swift_ahmedabad
- **LinkedIn**: https://www.linkedin.com/company/swift-ahmedabad/
- **Luma**: https://lu.ma/user/swiftahmedabad
- **WhatsApp**: https://chat.whatsapp.com/FlZuWzMf8ak8C8yAmfRRVf
- **Instagram**: https://www.instagram.com/swift.ahmedabad/
- **Aratt.ai**: https://aratt.ai/@swift_ahmedabad
- **Discord**: https://discord.gg/pswxUQxEny
- **Location**: https://www.google.com/maps/@23.014505,72.5713621,13z

## 🛠 Technologies

- HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- JavaScript (ES6+)
- JSON Data
- SVG Icons (embedded)
- GitHub Actions (CI/CD)

## 📁 File Structure

```
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js              # JavaScript for rendering content
├── links.json          # All links and community info (EDIT THIS!)
├── assets/             # Images and logos
│   └── swiftAhmedabad.jpg
└── .github/workflows/  # Deployment config
    └── deploy.yml
```

## 📄 License

© 2026 Swift Ahmedabad. All rights reserved.
