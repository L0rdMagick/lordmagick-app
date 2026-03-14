const API_KEY = 'ae9d9cc54cbb43f6a272de6a24e1d9bb'
const HOST = 'lordmagick.com'
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`

async function submitUrls() {
  const baseUrl = `https://${HOST}`
  
  // Routes from src/app/sitemap.ts
  const routes = [
    '',
    '/hall',
    '/spell-room',
    '/oracle-room',
    '/the-magick-psychic-school',
    '/magickal-tools',
    '/grimoire',
    '/store',
    '/spell-room/wiccan',
    '/spell-room/hoodoo-voodoo',
    '/spell-room/electric',
    '/spell-room/grimoire-of-digital-servitors',
    '/spell-room/love-spells-app',
    '/oracle-room/tarot-reading',
    '/oracle-room/human-design',
    '/the-magick-psychic-school/magick-training',
    '/the-magick-psychic-school/psychic-training',
    '/the-magick-psychic-school/psychic-training/geo-viewing',
    '/the-magick-psychic-school/the-magick-library',
    '/magickal-tools/electro-magickal-wands',
    '/magickal-tools/energy-work',
    '/magickal-tools/tarot-decks',
  ].map((route) => `${baseUrl}${route}`)

  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: routes
  }

  console.log(`Submitting URLs for ${HOST} to IndexNow...`)
  console.log('Payload:', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      console.log('Successfully submitted URLs to IndexNow!')
    } else {
      console.error(`Failed to submit URLs. Status: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error('Response:', text)
    }
  } catch (error) {
    console.error('Error submitting to IndexNow:', error)
  }
}

submitUrls()
