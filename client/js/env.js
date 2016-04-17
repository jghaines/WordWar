// production configuration from env.js
var ENV = {
    webSocketUrl    : "http://word-war.us-west-2.elasticbeanstalk.com",
    restBaseUrl     : "https://fqjtrlps5h.execute-api.us-west-2.amazonaws.com/prod",
    auth0 : {
        domain              : "jghaines.auth0.com",    
        accountClientId     : "dvfcaBbvoarFA2Q6zDZSoGfzLPq2XbXH",
        applicationClientId : "M69Mp6BBlK2CYo4MrUkBhiDKUpsg81vn",
        awsRole             : "arn:aws:iam::458298098107:role/wordwar-api-client",
        awsPrincipal        : "arn:aws:iam::458298098107:saml-provider/jghaines.auth0.com",
        delegationUrl       : "https://jghaines.auth0.com/delegation",
    }
}
