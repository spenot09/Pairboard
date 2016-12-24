const Message = require( '../models/message.model' );
const User = require( '../models/user.model' );
const createConversationId = require( './createConversationId' );

module.exports = {


  createMessage: ( req, res ) => {
  /*
  / receives the sender and recipient username
  / opens a frontend route with Sender & Recip prepopulated,
  / also prepops the hidden conversationID
  / (a sha 1 of the participants in ABC order)
  */
    const sender = req.body.username;
    const recipient = req.body.poster;
    const conversationID = createConversationId( sender, recipient );
    res.status( 200 ).send( {
      sender,
      recipient,
      conversationID,
    } );
  },

  getMessages: ( req, res ) => {
  /*
  / shows current user's 'mailbox' - a list of contacts
  / listed in order of most recent messages
  */
    const username = req.username;
    User.find(
      { username },
      ( err, user ) => {
        if ( err ) return err;
        const conversations = user.conversations;
        Message.find(
          { conversations },
          ( err, messages ) => {
            if ( err ) return err;
            res.json( messages );
          }
        );
      }
    );
  },

  getConversation: ( req, res ) => {
  /*
  / shows all messages with the same conversationID
  / listed most recent first
  */
    const conversationId = req.params.id;
    Message.find(
      { conversationId },
      ( err, messages ) => {
        if ( err ) return err;
        res.json( messages );
      }
    );
  },

  submitMessage: ( req, res ) => {
  /*
  / posts a message to the conversation thread
  */
    const toUser = req.body.toUser;
    const fromUser = req.body.fromUser;
    // if conv is new, write it to both users
    const conversationId = createConversationId( toUser, fromUser );
    const timeStamp = new Date();
    const messageBody = req.body.messageBody;
    const newMessage = Message( {
      toUser,
      fromUser,
      conversationId,
      timeStamp,
      messageBody,
    } );
    newMessage.save( err => {
      if ( err ) return err;
      res.send( { status: 200, message: 'Message sent.' } );
    } );
  },

  updateMessage: ( req, res ) => {
  /*
  / receives a query string in url
  / query might be to flag the post
  / or mark it as accepted / declined
  */
    const id = req.params.id;
    const status = req.query.status;
    const flag = req.query.flag;
    if ( !status && !flag ) {
      res.json( { status: '200', message: 'Nothing to update.' } );
    } else if ( status === 'accepted' ) {
      Message.findByIdAndUpdate( id, { status: 'accepted' } );
    } else if ( status === 'declined' ) {
      Message.findByIdAndUpdate( id, { status: 'declined' } );
    } else if ( flag === 'true' ) {
      Message.findByIdAndUpdate( id, { status: true } );
    } else {
      res.json( { status: '400', message: 'Bad request.' } );
    }
  },

  deleteOneMessage: ( req, res ) => {
  /*
  / deletes message based on message id
  / (only sender can delete)
  */
    const id = req.params.id;
    Message.findByIdAndRemove( id );
  },
};
