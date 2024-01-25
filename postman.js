/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2019 The Johns Hopkins University Applied Physics Laboratory LLC (JHU/APL).  All Rights Reserved.
//
// This material may be only be used, modified, or reproduced by or for the U.S. Government pursuant to the license
// rights granted under the clauses at DFARS 252.227-7013/7014 or FAR 52.227-14. For any other permission, please
// contact the Office of Technology Transfer at JHU/APL: Telephone: 443-778-2792, Internet: www.jhuapl.edu/ott
//
// NO WARRANTY, NO LIABILITY. THIS MATERIAL IS PROVIDED "AS IS." JHU/APL MAKES NO REPRESENTATION OR WARRANTY WITH
// RESPECT TO THE PERFORMANCE OF THE MATERIALS, INCLUDING THEIR SAFETY, EFFECTIVENESS, OR COMMERCIAL VIABILITY, AND
// DISCLAIMS ALL WARRANTIES IN THE MATERIAL, WHETHER EXPRESS OR IMPLIED, INCLUDING (BUT NOT LIMITED TO) ANY AND ALL
// IMPLIED WARRANTIES OF PERFORMANCE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF
// INTELLECTUAL PROPERTY OR OTHER THIRD PARTY RIGHTS. ANY USER OF THE MATERIAL ASSUMES THE ENTIRE RISK AND LIABILITY
// FOR USING THE MATERIAL. IN NO EVENT SHALL JHU/APL BE LIABLE TO ANY USER OF THE MATERIAL FOR ANY ACTUAL, INDIRECT,
// CONSEQUENTIAL, SPECIAL OR OTHER DAMAGES ARISING FROM THE USE OF, OR INABILITY TO USE, THE MATERIAL, INCLUDING,
// BUT NOT LIMITED TO, ANY DAMAGES FOR LOST PROFITS.
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// handles posting

function findSubObj(callkey, obj) {
    var retObj
    // console.debug('find subobj')
    if (obj === undefined) {
        return undefined
    }
    Object.entries(obj).forEach(([key, value]) => {
        // console.debug(key)
        if (callkey === key) {
            retObj = value
        }
    })
    return retObj
}

module.exports = {
    valid: (call, parent) => {
        var callParts = call.split('/')
        if (parent.testFlag) console.debug(callParts)
        // callParts[0] === 'api'
        var topObj
        // var path
        var serviceIndex
        parent.baseServices.forEach((item, i) => {
            if (parent.testFlag) console.debug(item.id)
            if (item.id === callParts[1]) {
                serviceIndex = i
                topObj = item.obj
                // path = item.path
            }
        })
        if (parent.testFlag) console.debug(topObj)
        var componentObj = findSubObj(callParts[2], topObj) // e.g. valves -> 0
        if (parent.testFlag) console.debug(componentObj)
        var paramObj = findSubObj(callParts[3], componentObj) // e.g. valves -> 0 -> State
        if (parent.testFlag) console.debug(paramObj)
        if (paramObj === undefined) {
            throw new Error('Invalid API call. NOT EXECUTING. call: '.concat(call.toString()))
        }
        return {
            key: callParts[2],
            value: componentObj,
            subkey: callParts[3],
            subvalue: paramObj,
            service: parent.baseServices[serviceIndex],
            body: undefined,
            res: {
                send: () => { },
                json: () => { },
                status: () => {
                    console.debug('Post Error')
                    return {
                        send: e => {
                            console.debug(e)
                        },
                    }
                },
            },
            basePath: '', // note: this would need to be filled in to use links
        }

    },
    post: (parent, call, value) => {
        if (call.match(/(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/gm)) {
            // external post
            console.debug('External post not yet implemented')
        } else {
            // internal post
            handleObject = module.exports.valid(call, parent)
            if (handleObject) {
                // post the value
                handleObject.body = value
                parent.handlePost(handleObject)
            }
        }
    }
}