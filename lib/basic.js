/*
 * Copyright 2013 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

(function(module) {
    "use strict"
    
    var knit = require('knit').config(function(bind){
        bind('UUIDGenerator').to(require('./UUIDGenerator.js'))
    })

    module.exports = function() {
    
        return knit.inject(function(UUIDGenerator) {
            
            return {
                persist : function (o) {
                    o._id = UUIDGenerator()
                }
            }
            
        })
    }
    
})(module)
