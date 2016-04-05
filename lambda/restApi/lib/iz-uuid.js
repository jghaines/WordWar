const uuid = {
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};

function isUUID(str, version) {
    version = version || 'all';
    if(typeof value !=='string'){
        return false;
    }
    const pattern = uuid[version];
    return pattern && pattern.test(str);
}

module.exports = function addUuidForIz(iz) {
    if ( ! iz.hasOwnProperty( 'uuid' )) {
        iz.addValidator('uuid', isUUID);
    }
}