var CONSTANTS = require('./constants');
var dbDAO = require('./dbDAO');

// export the class
module.exports = Request;

function Request() {

}


Request.prototype.find_requester = function (req, callback) {
  var dbDAOObj = new dbDAO();

  dbDAOObj.openConnection(
      function()
      {
          //var insertRequestParamters = {
          //updateVolunteerStatus
          callback();
      }
  );
};

Request.prototype.applyVolunteerAction = function (req, callback) {
  console.log('req:', JSON.stringify(req));

  var dbDAOObj = new dbDAO();

  dbDAOObj.openConnection(
      function()
      {
          var updateRequestParamters = {};
          updateRequestParamters.format = {};
          updateRequestParamters.format.RequestID = req.request_id;
          updateRequestParamters.update = {};

          if( req.action === 'cancel' ) {
              updateRequestParamters.update.RequestStatus = "pending";
          } else if ( req.action === 'approve' ) {
            updateRequestParamters.update.RequestStatus = "inprogress";
            updateRequestParamters.update.VolunteerEMail= req.volunteer_email;
          }
          console.log('updateRequestParamters:', JSON.stringify(updateRequestParamters));

          dbDAOObj.updateRequest( updateRequestParamters ,
            function(updateRequestResult)
            {
              if(updateRequestResult.statusCode === CONSTANTS.SUCCESS_RESPONSE)
              {

                var updateVolunteerStatusParamters = {};
                updateVolunteerStatusParamters.VolunteerStatus = (req.action == 'approve') ? "induty": "online";
                updateVolunteerStatusParamters.VolunteerEMail = req.volunteer_email;
                updateVolunteerStatusParamters.LastStatusTimeStamp = new Date(); 
                console.log('updateVolunteerStatusParamters:', JSON.stringify(updateVolunteerStatusParamters));

                dbDAOObj.updateVolunteerStatus( updateVolunteerStatusParamters,
                  function(updateVolunteerStatusResult)
                  {
                    callback(updateVolunteerStatusResult);
                  }
                );

              }
            }

          );

      }
    );
};

Request.prototype.findVolunteer = function (req, callback) {

      var dbDAOObj = new dbDAO();

      dbDAOObj.openConnection(
          function()
          {
              var insertRequestParamters = {
                  RequesterEMail: req.requester_email,
                  RequestDetailes: req.request_detailes,
                  RequestType: req.request_type,
                  VolunteerGender: req.volunteer_gender,
                  RequesterGender: req.requester_gender,
                  LocationLat: req.location_lat,
                  LocationLng: req.location_lng
              };

              dbDAOObj.insertRequest(insertRequestParamters,
                  function(insertRequestResult)
                  {
                      if(insertRequestResult.statusCode === CONSTANTS.SUCCESS_RESPONSE)
                      {
                            var VolunteerGenderCondition = " ";
                            if(req.volunteer_gender == 'male')
                              VolunteerGenderCondition = ", VolunteerGender = male ";
                            else if(req.volunteer_gender == 'female')
                              VolunteerGenderCondition = ", VolunteerGender = female ";

                            var RequsterGenderCondition = " ";
                            if(req.volunteer_gender == 'male')
                              RequsterGenderCondition = ", RequesterGender = male ";
                            else if(req.volunteer_gender == 'female')
                              RequsterGenderCondition = ", RequesterGender = female ";


                            var findVolunteerParamters = {
                              LocationLat: req.location_lat,
                              LocationLng: req.location_lng,
                              RequestType: req.request_type,
                              VolunteerGenderCondition: VolunteerGenderCondition,
                              RequsterGenderCondition: RequsterGenderCondition
                            };

                            //search for volunteer
                            dbDAOObj.findVolunteer(findVolunteerParamters,
                                  function(findVolunteerResult)
                                  {
                                      //if we have volunteer change it is type to 'inprogress'
                                      if((findVolunteerResult.statusCode === CONSTANTS.SUCCESS_RESPONSE) && (findVolunteerResult.volunteerInfo.length > 0))
                                      {

                                          var updateRequestParamters = {};
                                          updateRequestParamters.update = {};
                                          updateRequestParamters.format = {};

                                          updateRequestParamters.format.RequestID =  insertRequestResult.RequestID;
                                          updateRequestParamters.update.RequestStatus = "inprogress";

                                          dbDAOObj.updateRequest( updateRequestParamters,
                                              function(updateRequestResult){
                                                  if(updateRequestResult.statusCode === CONSTANTS.SUCCESS_RESPONSE)
                                                  {

                                                      var updateVolunteerStatusParamters = {
                                                          VolunteerStatus : "talking",
                                                          VolunteerEMail: findVolunteerResult.volunteerInfo[0].VolanteerEMail
                                                      };

                                                      dbDAOObj.updateVolunteerStatus( updateVolunteerStatusParamters,
                                                        function(updateVolunteerStatusResult)
                                                        {
                                                          callback(findVolunteerResult);
                                                        }
                                                      );
                                                  }
                                              }
                                          );
                                      }
                                      else {
                                        callback(findVolunteerResult);
                                      }

                                  }
                            );
                      }
                  }
              );
          }
      );
};
