//this opens the connection
//set answer const answer = ...<generated answer sdp from peerB.js> 
localConnection.setRemoteDescription (answer).then(a=>console.log("done"))