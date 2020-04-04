/**
 * https://www.oauth.com/oauth2-servers/token-introspection-endpoint/
 *
 * mock for token introspection end-point
 * @param {string} token
 */
function introspectToken(token) {
  if (token === 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3') {
    return {
      active: true,
      scope: 'user:write:*'
    }
  }

  return {
    active: false,
  }
}

module.exports = {
  introspectToken
}
