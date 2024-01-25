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

const binary = require('./handle/binary.js')
const datapoint = require('./handle/datapoint.js')
const dateRange = require('./handle/date-range.js')
const link = require('./handle/link.js')
const list = require('./handle/list.js')
const number = require('./handle/number.js')
const string = require('./handle/string.js')

function caseHandler({service, key, subkey, body, res, subvalue, basePath, generateNewRoutes, app}) {
    switch (subvalue.type[1]) {
    case 'binary':
        // console.debug(body)
        binary.handle({service, key, subkey, body, res})
        break
    case 'number':
        number.handle({service, key, subkey, body, res})
        break
    case 'string':
        string.handle({service, key, subkey, body, res})
        break
    case 'datapoint':
        datapoint.handle({service, key, subkey, body, res})
        break
    case 'list':
        list.handle({service, key, subkey, body, res})
        break
    case 'link':
        // requires access to CoreAPI to add additional routes (maybe emit event?)
        link.handle({service, key, subkey, body, res, basePath, generateNewRoutes, app})
        break
    case 'dateRange':
        dateRange.handle({service, key, subkey, body, res})
        break
    case 'button':
        // buttons will always be getter/setters due to their
        // abstract nature
        service.obj[key][subkey] = {res, body}
        break
    case 'file':
      // files will always be getter/setters due to their
      // abstract nature
      // in the future, this should/might be streamable, or a separate file-stream will be implemented
      service.obj[key][subkey] = {res, body}
      break
    default:
        return res.status(400).send({
            message: 'subvalue type is unknown: ' + subvalue.type[1],
        })
    }
}

function handlePost({key, value, subkey, subvalue, service, body, res, basePath, generateNewRoutes, app}) {
    // check subvalue datatype (e.g. Set Point)
    console.debug('body')
    console.debug(body)
    console.debug(key)
    console.debug(subkey)
    // console.debug(subvalue)
    if (subvalue.type) {
      console.debug('type defined')
      // check the type
      if (subvalue.type[0] === 'output') {
        console.debug('type output')
        if (subvalue.type[1]) {
          console.debug('second type defined')
          caseHandler({service, key, subkey, body, res, subvalue, basePath, generateNewRoutes, app})
        } else {
          return res.status(400).send({
            message: 'Subvalue type has no defined value',
          })
        }
      } else if (subvalue.type[0] === 'input') {
        // cannot change inputs
        console.debug('Cannot change \'input\' types')
        return res.status(400).send({
          message: 'Cannot change \'input\' types',
        })
      } else {
        // unknown data type
        console.debug('Subvalue type is neither \'output\' nor \'input\': ' + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + subkey)
        console.debug(subvalue)
        return res.status(400).send({
          message: 'Subvalue type is neither \'output\' nor \'input\'',
        })
      }
    } else {
      return res.status(400).send({
        message: 'Subvalue type not defined',
      })
    }
  }

  module.exports = {
    handlePost: handlePost
  }