# Swift Ahmedabad

Swift Ahmedabad’s community website. Liquid Night is the homepage in `index.html`; extend this approved public-feedback version for future work. Old `designs.html` URLs forward to it, and the previous bento page is retained at `community.html`.

## 🚀 Getting Started

### GitHub Pages (existing host)

The public feedback version uses Sites for now. GitHub Pages settings and write access must be verified before updating the existing address; no deployment workflow is included.

### Manual GitHub Pages setup

1. Go to **Settings** > **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select `main` or `master` branch and `/ (root)` folder
4. Click **Save**

## Public feedback publishing

Sites identity lives in `.openai/hosting.json`; reuse its project ID. Publish from the committed Liquid Night baseline, keeping `index.html` as the homepage. The existing GitHub Pages site remains unchanged while feedback uses Sites.

Export the committed source into the dedicated Sites source checkout. Generate its static output with native copy commands:

```sh
mkdir -p dist
cp *.html *.css *.js *.json cityscape.mjs headline-glass.mjs dist/
cp -R assets css dist/
```

For a subsequent release, clear the generated `dist/` directory first so removed files do not survive. Use the Sites source helper to commit/push and package that source, then save and deploy the returned version with public access. `dist/` is ignored build output. Keep the four excluded root working documents outside the source export. Tracked feedback notes and retired prototype sources may remain in Git; the copy commands above exclude Markdown and inactive prototype modules from the public runtime. Never include credentials in files or Git.

Checks: `node designs.check.mjs`, `node cityscape.check.mjs`, `node navigation.check.mjs` (retained bento page), and `node headline-glass.check.mjs`. Review the homepage over HTTP before publishing.

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
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # JavaScript for rendering content
├── links.json              # Community links and info (EDIT THIS!)
├── app.json                # SwiftTalks app details (EDIT THIS!)
├── assets/                 # Images and logos
│   ├── swiftAhmedabad.jpg
│   └── SwiftTalksAssets/  # App showcase screenshots
└── .github/workflows/      # Deployment config
    └── deploy.yml
```

## 📄 License

© 2026 Swift Ahmedabad. All rights reserved.
