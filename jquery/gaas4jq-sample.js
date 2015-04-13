// globalscope for debugging and pedagogical purposes
var gaasClient;
var gaasProject;

window.onload = function() {
    $('#hello').text('(loading)');
    
    gaasClient = gaas.getClient(sampleconfig);
    
    gaasProject = gaasClient.project(sampleconfig.project);
    
    gaasProject.getResourceData({languageID:'es'}, function cb(err, resp) {
        /*
            'resp' looks like this (on success):
              var resp = {
                  data: {
                          "hello":  "Hello world", 
                          ...  (all other k/v pairs )
                  },
                  ...
              };
              
              For this sample we are only printing out one, 'hello'
        */
        if(err) { 
            $('#hello').text('ERR: ' + err.toString());
        } else {
            $('#hello').text(resp.data.hello);
        }
    });
};