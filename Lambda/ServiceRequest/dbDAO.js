var mysql = require('mysql');
var stringFormat = require('string.format');
var enviroment = require('./enviroment');
var CONSTANTS = require('./constants');
const uuidv4 = require('uuid/v4');

// export the class
module.exports = dbDAO;

var INSERT_NEW_REQUEST = "INSERT INTO hajj_hackathon_requests_table SET ? ";

//will be used to 1- add volunteer & Date then 2- to add feedback & rate on volunteer
var UPDATE_REQUEST = "UPDATE hajj_hackathon_requests_table SET ? WHERE RequestID = '{RequestID}' ";

var SELECT_REQUEST = "select * from hajj_hackathon_requests_table SET ? VolunteerEMail is NULL {LocationCondition} {VolunteerGender} {} order by RequestDate asc LIMIT 1";

var SELECT_VOLUNTEER = "select * , " +
      " 111.045 * DEGREES(ACOS(COS(RADIANS({LocationLat})) * COS(RADIANS(LocationLat)) * COS(RADIANS(LocationLng) - RADIANS({LocationLng})) + SIN(RADIANS({LocationLat})) * SIN(RADIANS(LocationLat)))) AS distance_in_km " +
      " from hajj_hackathon_volunteer_table where RequestType = {RequestType}, VolunteerStatus = 'online' {VolunteerGenderCondition} {RequsterGenderCondition} order by distance_in_km, OnlineTimeStamp desc LIMIT 1";

var CHANGE_VOLUNTEER_STATUS = " update hajj_hackathon_volunteer_table set VolunteerStatus = '{VolunteerStatus}', LastStatusTimeStamp = {LastStatusTimeStamp} where VolunteerEMail = '{VolunteerEMail}' ";

// Constructor
function dbDAO() {
  // always initialize all instance properties
  this.connection = mysql.createConnection({
      host: enviroment.DB_HOST,
      user: enviroment.DB_USER,
      password: enviroment.DB_PSWD,
      database: enviroment.DB_SCHEMA
  });
}

dbDAO.prototype.openConnection = function (callback) {
  var connection = this.connection;
  connection.connect(
      function (connectErr) {
          console.log(' open connection error : ' + JSON.stringify(connectErr));
          callback();
      }
    );

};

dbDAO.prototype.closeConnection = function () {
    this.connection.end(
        function (err) {
            // The connection is terminated now
            if( err )
                console.log(' dbDAO closeConnection error : ' + JSON.stringify(err));
        }
    );
};


dbDAO.prototype.insertRequest = function (para, callback) {
    console.log('Inside insertRequest fn');

    var fnResult = {};

    var connection = this.connection;
    para.RequestID = uuidv4();
    var query = connection.query(INSERT_NEW_REQUEST, para,
      function (queryErr, queryResult) {

        if (!queryErr) {
          fnResult.statusCode = CONSTANTS.SUCCESS_RESPONSE;
          fnResult.RequestID = para.RequestID ;
          fnResult.updatedAt = new Date();
        }
        else {
            fnResult.statusCode = CONSTANTS.ERROR_RESPONSE;
            fnResult.error_description = queryErr.stack;
        }

        console.log('insertRequest fnResult : ' + JSON.stringify(fnResult));
        callback(fnResult);
      }
    );

};


dbDAO.prototype.selectRequest = function (para, callback) {
    console.log('inside getRequest fn');

    var connection = this.connection;
    var selectQuery = SELECT_REQUEST.format(para.format);
    console.log('selectQuery : ' + selectQuery);

    connection.query(selectQuery,
        function (queryErr, queryResult) {
            var fnResult = {};

            if (!queryErr) {
                fnResult.statusCode = CONSTANTS.SUCCESS_RESPONSE;
                fnResult.requestsArray = queryResult;
            }
            else {
                console.log('queryErr : ' + JSON.stringify(queryErr));
                fnResult.statusCode = CONSTANTS.ERROR_RESPONSE;
                fnResult.error_description = queryErr.stack;
            }

            callback(fnResult);
        }
    );
};

dbDAO.prototype.findVolunteer = function (para, callback) {
    console.log('inside getRequest fn');

    var connection = this.connection;
    var selectQuery = SELECT_VOLUNTEER.format(para);
    console.log('selectQuery : ' + selectQuery);

    connection.query(selectQuery,
        function (queryErr, queryResult) {
            var fnResult = {};

            if (!queryErr) {
                fnResult.statusCode = CONSTANTS.SUCCESS_RESPONSE;
                fnResult.volunteerInfo = queryResult;
            }
            else {
                console.log('queryErr : ' + JSON.stringify(queryErr));
                fnResult.statusCode = CONSTANTS.ERROR_RESPONSE;
                fnResult.error_description = queryErr.stack;
            }

            callback(fnResult);
        }
    );
};


dbDAO.prototype.updateVolunteerStatus = function (para, callback) {
    console.log('inside updateVolunteerStatus fn');
    var fnResult = {};

    var connection = this.connection;

    var updateQuery = CHANGE_VOLUNTEER_STATUS.format(para);
    console.log('updateQuery : ' + updateQuery);

    var query = connection.query(updateQuery,
        function (queryErr, queryResult) {
            if (!queryErr) {
                fnResult.statusCode = CONSTANTS.SUCCESS_RESPONSE;
                fnResult.updatedAt = new Date();
            }
            else {
                fnResult.statusCode = CONSTANTS.ERROR_RESPONSE;
                fnResult.error_description = queryErr.stack;
            }

            console.log('updateVolunteerStatus fnResult : ' + JSON.stringify(fnResult));
            callback(fnResult);
        }
    );
};




dbDAO.prototype.updateRequest = function (para, callback) {
    console.log('inside updateRequest fn');
    var fnResult = {};

    var connection = this.connection;

    var updateQuery = UPDATE_REQUEST.format(para.format);
    console.log('updateQuery : ' + updateQuery);

    var query = connection.query(updateQuery, para.update,
        function (queryErr, queryResult) {
            if (!queryErr) {
                fnResult.statusCode = CONSTANTS.SUCCESS_RESPONSE;
                fnResult.updatedAt = new Date();
            }
            else {
                console.log('queryErr : ' + JSON.stringify(queryErr));

                fnResult.statusCode = CONSTANTS.ERROR_RESPONSE;
                fnResult.error_description = queryErr.stack;
            }

            console.log('updateInvitation fnResult : ' + JSON.stringify(fnResult));
            callback(fnResult);
        }
    );
};
