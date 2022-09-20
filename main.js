const app = require(`express`)();
const server = require(`http`).Server(app);
const io = require(`socket.io`)(server);
const Users = require("./models/Users");


const PORT = process.env.PORT || 3001;

server.listen(PORT);

let sockets = []; // Array holding sockets associated with userIds

const findNear = async({ postion , socket , userId}) => {
    const user = await Users.findOne({_id: userId})

    if(!user) return [];

    if (!(user.position.coordinates[0] === position[0] && user.position.coordinates[1] === position[1])) {
        user.position = {
            type: `Point`,
            coordinates: position
        };
        await user.save();
    }

    const users = await Users.find({
        position: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [ user.position.coordinates[0], user.position.coordinates[1] ]
                },
                $maxDistance: 500,
                $minDistance: 0,
            }
        }
    })

    const usersFound = users.map(({ _id, displayName, profilePictureUrl, gender, message }) => ({ _id, displayName, profilePictureUrl, gender, message }));

    socket.emit('found-near' , usersFound)
}

const setUp = async () => {
    await Users.remove({})

    io.on('connection' , (socket) => {

        socket.on('login' , async ({ twitterName , twitterUid , walletAddress , NFTCollections , profilePictureUrl , position , message}) => {
            
            const newUser = new Users({
                twitterName,
                twitterUid,
                position: {
                    type: 'point',
                    coordinates: position
                },
                walletAddress,
                NFTCollections,
                profilePictureUrl,
                message,
                isOnline: true,
            })

            const { _id: userId } = await newUser.save()
            
            sockets.push({
                userId,
                socket
            })

            socket.emit('logged-in', userId)

            socket.on('delete' , async () => {
                await Users.remove({ _id : newUser._id})
                sockets = sockets.filter(u => u.userId !== userId)
            })

            socket.on('disconnect', async () => {
                await Users.remove({_id: userId })
                console.log('DELETE', userId)
                sockets = sockets.map(u => u.userId !== userId)
            })

            socket.on('find-near', async (newPosition) => {
                await findNear({postion: newPosition , socket , userId})
            })

            socket.on('ask-user' , async (othersSocketId) => {


                const found = sockets.find(u => u.userId.equals(othersSocketId))

                if(!found) {
                    socket.emit('user-not-found')
                    return
                }

                const { socket: othersSocket } = found;
                
                othersSocket.emit('chat-request' , userId);

                othersSocket.once('request-accepted', (uid) => {
                    if( userId.equals(uid)) {
                        socket.emit('request-accepted' , uid)
                    }
                })

                othersSocket.once('request-denied' , (uid) => {
                    if( userId.equals(uid)){
                        socket.emit('request-denied' , uid)
                    }
                })

            })

            socket.on('send-chat-message' , ({userId , message}) => {
                const found = sockets.find(u => u.userId.equals(userId))

                if(!found) return;

                const {socket: recipientSocket} = found;
                recipientSocket.emit('chat-message' , message)
            })

            await findNear({ postion , socket , userId })
            
        })
    })

    return app;
}

module.exports = {
    setUp
}
