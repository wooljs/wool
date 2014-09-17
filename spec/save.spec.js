/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */


var
save = require( __dirname + '/../lib/save.js'),
fs = require('fs'),
es = require('event-stream'),
stream = es.through(function write(data) {
    this.emit('data', data)
},
function end () {
    this.emit('end')
})
fileName = __dirname+"/test_save.db"
;

describe("paf", function() {

    if (fs.existsSync(fileName)) fs.unlinkSync(fileName)

    var saver = save(fs, es)

    it("pouf", function() {
        var date = new Date()
        saver(fileName, stream)
            
        stream.write({ id: "plop", created: date })
        stream.end()
        var file_exists = fs.existsSync(fileName)
        expect(file_exists).toEqual(true,'File '+fileName+' exists')
        
        var run = false
        if (file_exists) {
            waitsFor(function() {
                return run;
            }, "The Value should be incremented", 5000);
            
            fs.readFile(fileName,{encoding:'utf8'}, function (err, data) {
                if (err) throw err;
                
                expect(data).toEqual('{"id":"plop","created":"'+date.toISOString()+'"}\n')
                
                fs.unlink(fileName, function(err) {
                    if (err) throw err;
                    run = true
                })
            })
            runs(function() {
                console.log('here again')
                expect(run).toEqual(true)
            })
        }
    });
});
