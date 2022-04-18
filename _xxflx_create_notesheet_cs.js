define(["N/search", "N/transaction", "N/ui/dialog", "N/ui/message", "N/runtime", "N/url", "N/http", "N/https", "N/log", "N/currentRecord", "N/record"],
    function (search, transaction, dialog, message, runtime, url, http, https, log, currentRecord, record) {

        /**
         * Module Description...
         *
         * @exports XXX
         *
         * @copyright 2019 ${organization}
         * @author ${author} <${email}>
         *
         * @NApiVersion 2.x
         * @NScriptType ClientScript
         */
        var exports = {};

        /**
         * <code>pageInit</code> event handler
         *
         * @governance XXX
         *
         * @param context
         *        {Object}
         * @param context.mode
         *        {String} The access mode of the current record. Will be one of
         *            <ul>
         *            <li>copy</li>
         *            <li>create</li>
         *            <li>edit</li>
         *            </ul>
         *
         * @return {void}
         *
         * @static
         * @function pageInit
         */

        function pageInit(scriptContext) {
            return;
        }
        function createNoteSheet() {
            var itemQty = [];
            var itemArr = [];
            var currentRecObj = currentRecord.get();
            var transPrintid = currentRecObj.getValue('id');
            var recObj = record.load({
                type: record.Type.SALES_ORDER,
                id: transPrintid,
                isDynamic: false,
            })
            var sysDate = new Date();
            var projectManager = recObj.getValue({
                fieldId: 'custbody_xxflx_project_manager'
            })
            var lineCount = recObj.getLineCount({
                sublistId: 'item'
            })
            for (var i = 0; i < lineCount; i++) {
                var item = recObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                })
                var qty = recObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                })
                var lineId = recObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'line',
                    line: i
                })
                var qtyFulfill = calcPickedQty(transPrintid, item, lineId)
                //alert(qtyFulfill)
                var remQty = parseFloat(qty) - parseFloat(qtyFulfill)
                //alert("LIne 73 " +remQty)
                itemArr.push(item);
                itemQty.push(remQty);
            }
            var redirectUrl = url.resolveRecord({
                isEditMode: true,
                recordType: 'customrecord_xxflx_notesheet',
                params: {
                    'oen_ref_num': transPrintid,
                    'notesheet_approval_status': 1,
                    'notesheet_project_manager': projectManager,
                    'notesheet_date': sysDate,
                    'notesheet_item': JSON.stringify(itemArr),
                    'notesheet_qty': JSON.stringify(itemQty),
                }
            })
            window.open(redirectUrl);
        }
        function calcPickedQty(transPrintid, item, lineId) {
            try {
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["internalid", "anyof", transPrintid],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["item", "anyof", item],
                            "AND",
                            ["line", "equalto", lineId]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" })
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                var pickedQty;
                log.debug("salesorderSearchObj result count", searchResultCount);
                salesorderSearchObj.run().each(function (result) {
                    pickedQty = result.getValue({
                        name: "quantityshiprecv"
                    })
                    return true;
                });
                return pickedQty
            } catch (error) {
                log.error({
                    title: error.name,
                    details: error.message
                })
            }
        }
        function createPurchaseEnquiry() {
            var itemQty = [];
            var itemArr = [];
            var currentRecObj = currentRecord.get();
            var transPrintid = currentRecObj.getValue('id');
            var recObj = record.load({
                type: record.Type.SALES_ORDER,
                id: transPrintid,
                isDynamic: false,
            })
            var sysDate = new Date();
            var projectManager = recObj.getValue({
                fieldId: 'custbody_xxflx_project_manager'
            })
            var lineCount = recObj.getLineCount({
                sublistId: 'item'
            })
            //alert(lineCount)
            for (var i = 0; i < lineCount; i++) {
                var item = recObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                })
               // alert(item)
                var qty = recObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                })
                //alert(qty)
                itemArr.push(item);
                itemQty.push(qty);
            }
            //alert(itemArr)
            //alert(itemQty)
            var redirectUrl = url.resolveScript({
                deploymentId: 'customdeploy_xxflx_purchase_enquiry_sut',
                scriptId: 'customscript_xxflx_purchase_enquiry_sut',
                params: {
                    'oenNumber': transPrintid,
                    'itemArr': JSON.stringify(itemArr),
                    'itemQty': JSON.stringify(itemQty),
                }
            })
            window.open(redirectUrl);
        }
        //exports.createNoteSheet = createNoteSheet;
        exports.createPurchaseEnquiry = createPurchaseEnquiry;
        exports.pageInit = pageInit
        return exports;
    });
