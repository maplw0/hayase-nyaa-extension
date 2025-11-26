import AbstractSource from './abstract.js'

export default new class NyaaSi extends AbstractSource {
  // This is a proxy API that converts Nyaa HTML to JSON
  base = 'https://torrent-search-api-livid.vercel.app/api/nyaasi/'

  /** * Main search function
   * @type {import('./').SearchFunction} 
   */
  async single({ titles, episode }) {
    // If no title is provided by Hayase, we can't search
    if (!titles?.length) return []

    // 1. Build the search query string
    const query = this.buildQuery(titles[0], episode)
    
    // 2. Fetch data from the API
    const url = `${this.base}${encodeURIComponent(query)}`
    const res = await fetch(url)
    const data = await res.json()

    // 3. Validate response
    if (!Array.isArray(data)) return []

    // 4. Map the data to Hayase's format
    return this.map(data)
  }

  // Reuse logic for batch and movie since Nyaa search works the same for all
  batch = this.single
  movie = this.single

  /**
   * Helper to format the search string.
   * Cleans special characters and adds episode number if present.
   */
  buildQuery(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`
    return query
  }

  /**
   * Maps external API results to Hayase TorrentResult type
   */
  map(data) {
    return data.map(item => {
      // Extract hash from magnet link if not explicitly provided
      const hash = item.Magnet?.match(/btih:([a-fA-F0-9]+)/)?.[1] || ''

      return {
        title: item.Name || 'Unknown Title',
        link: item.Magnet || '',
        hash,
        seeders: parseInt(item.Seeders || '0'),
        leechers: parseInt(item.Leechers || '0'),
        downloads: parseInt(item.Downloads || '0'),
        size: this.parseSize(item.Size),
        date: new Date(item.DateUploaded),
        verified: false, // Nyaa doesn't have a standard verified flag in this API
        type: 'alt',     // Defaulting to 'alt' (alternative)
        accuracy: 'medium'
      }
    })
  }

  /**
   * Helper to convert size strings (e.g., "1.2 GiB") to bytes
   */
  parseSize(sizeStr) {
    if (!sizeStr) return 0;
    const match = sizeStr.match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/i)
    if (!match) return 0

    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()

    switch (unit) {
      case 'KIB':
      case 'KB': return value * 1024
      case 'MIB':
      case 'MB': return value * 1024 * 1024
      case 'GIB':
      case 'GB': return value * 1024 * 1024 * 1024
      default: return 0
    }
  }

  // Hayase calls this to check if the extension is working
  async test() {
    try {
      const res = await fetch(this.base + 'one piece')
      return res.ok
    } catch {
      return false
    }
  }
}()