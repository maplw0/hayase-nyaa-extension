/**
 * @typedef {import('./').TorrentSource} TorrentSource
 */

/**
 * @implements {TorrentSource}
 */
export default class AbstractSource {
  /**
   * Gets results for single episode
   */
  single (options) {
    throw new Error('Source doesn\'t implement single')
  }

  /**
   * Gets results for batch of episodes
   */
  batch (options) {
    throw new Error('Source doesn\'t implement batch')
  }

  /**
   * Gets results for a movie
   */
  movie (options) {
    throw new Error('Source doesn\'t implement movie')
  }

  /**
   * Tests connection
   * @type {()=>Promise<boolean>}
   */
  test () {
    throw new Error('Source doesn\'t implement test')
  }
}