var Request = require('./Request');
var CONSTANTS = require('./constants');




//exports.request = (req, res) => {
//    console.log('Received req:', JSON.stringify(req));

exports.handler = (event, context, callback) => {

    console.log('Received event:', JSON.stringify(event));
    console.log('Received context:', JSON.stringify(context));
    var req = event;

    var requestObj = new Request();

    switch (req.type) {

        case 'find_requester':
          //add request & search for avilable volunteer
          requestObj.findRequester(req,
                function(findRequesterResult){
                  console.log('findRequesterResult :', JSON.stringify(findRequesterResult));
                    if (findRequesterResult.statusCode === CONSTANTS.SUCCESS_RESPONSE){
                        //res.status(200).send(findRequesterResult);
                        context.succeed(findRequesterResult);
                    }
                    else{
                        //res.status(403).send(JSON.stringify(findRequesterResult));
                        return context.fail(JSON.stringify(findRequesterResult));
                    }
                }
          );
          break;

        case 'find_volunteer':
          //mark volunteer as avilable and search for requester
          requestObj.findVolunteer(req,
                function(findVolunteerResult){
                  console.log('findVolunteerResult :', JSON.stringify(findVolunteerResult));
                    if (findVolunteerResult.statusCode === CONSTANTS.SUCCESS_RESPONSE){
                        //res.status(200).send(findVolunteerResult);
                        context.succeed(findVolunteerResult);
                    }
                    else{
                        //res.status(403).send(JSON.stringify(findVolunteerResult));
                        return context.fail(JSON.stringify(findVolunteerResult));
                    }
                }
          );
          break;

        case 'volunteer_action':
          //based on action:
          //cancel: update volunteer status to online & request status to be pending
          //accept: update volunteer status to be offline & request (status, volunteerID, date)
          requestObj.applyVolunteerAction( req,
            function(acceptRequestResult){
              console.log('acceptRequestResult :', JSON.stringify(acceptRequestResult));
                if (acceptRequestResult.statusCode === CONSTANTS.SUCCESS_RESPONSE){
                    //res.status(200).send(acceptRequestResult);
                    context.succeed(acceptRequestResult);
                }
                else{
                    //res.status(403).send(JSON.stringify(acceptRequestResult));
                    return context.fail(JSON.stringify(acceptRequestResult));
                }
            }
          );
          break;

        case 'evaluate_volunteer':
          //get requester evaluation
          requestObj.evaluateVolunteer();
          break;


        default:
            console.log("Unsupported request");

            var fnResult = {
                statusCode: CONSTANTS.ERROR_RESPONSE,
            };
            return context.fail(JSON.stringify(fnResult));
        }

};
