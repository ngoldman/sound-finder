import soundCloud from 'sound-cloud'
import flatten from 'array-flatten'
import events from 'pub-sub'

/**
 * Get Soundcloud users that are like another user
 * @param {String} username Username of the user you'd like to research
 * @returns {Promise} Resolved with an array of similar user objects
 */
var sc = soundCloud('739b39925c3cc275aeb03837ff27762c')
var getFriends = (username) => {

  events.trigger('testEvent')
  return new Promise((resolve, reject) => {
    // get userid from username
    sc.userID(username)
    // get last 50 favorite tracks
    .then(user => {
      events.trigger('loader:update', {percentage: 10, message: `fetching ${username}'s favorites`})
      return sc.favorites(user.id)
    })
    // get all the people who favorited those tracks
    .then(favorites => {
      let allfavs = favorites.map(f => f.id).map(sc.trackFavorites)
      events.trigger('loader:update', {percentage: 30, message: `finding other users`})
      return Promise.all(allfavs)
    })
    // assemble an array
    .then(favoriters => {

      events.trigger('loader:update',{percentage: 50 , message: `comparing ${username} to other users`})

      // flatten all of the favoriters into one array
      favoriters = flatten(favoriters)
      let users = {}
      // create a hash of all user ids
      let hash = favoriters.map(f => f.id)
      // iterate over all ids, incrementing similarity
      hash.forEach((id, i) => {
        if (users[id]) {
          users[id].similarity += 1
        } else {
          users[id] = favoriters[i]
          users[id].similarity = 1
        }
      })

      events.trigger('loader:update',{percentage: 70 , message: 'ranking users based on similarity'})

      let similarUsers = []
      let keys = Object.keys(users)
      .sort((a,b) => users[b].similarity - users[a].similarity)
      .slice(0, 30)
      .forEach((key) => {
        similarUsers.push(users[key])
      })

      events.trigger('loader:update', {percentage: 100})

      resolve(similarUsers)
    })
    .catch(err => reject(err))
  })
}

export default getFriends