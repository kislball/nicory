config = require "../config.json"
mongodb = require "mongodb"

randint = (min, max) -> Math.round min - 0.5 + Math.random() * (max - min + 1)

module.exports = (client) ->
  event = (message) ->
    if !message.guild
      return

    conn = await mongodb.MongoClient.connect(config.mongo)
    col = conn.db("nicory").collection("user_exp")

    res = await col.findOne({'member': message.author.id, 'guild': message.guild.id})
    if res 
      return res.exp
    else
      return 0

    given = totalExp + randint(10,25)

    col.update({'guild': message.guild.id, 'member': message.author.id}, {$set: {exp: given}}, {upsert: true})




  # event
  client.on("message", event)