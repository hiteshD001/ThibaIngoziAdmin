/* eslint-disable react/prop-types */
import { useState } from "react";
import { useBulkUploadSalesAgent, useFileUpload, useUserFileUpload } from "../API Calls/API";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { toastOption } from "./ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import { MdFileDownload } from "react-icons/md";

const ImportSheet = ({ setpopup, popup, type = "driver" }) => {
    const [file, setFile] = useState(null);
    const [error, seterror] = useState("")
    const [apiError, setApiError] = useState([])

    const client = useQueryClient()

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const maxSize = 10 * 1024 * 1024;

        const validExcelTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (selectedFile) {
            if (!validExcelTypes.includes(selectedFile.type)) {
                seterror("Please select a valid Excel file ( .xls or .xlsx )");
                setFile(null);
            } else if (selectedFile.size > maxSize) {
                seterror("File size should not exceed 10 MB");
                setFile(null);
            } else {
                seterror("")
                setFile(selectedFile);
            }
        }
    };

    const onError = (error) => {
        setApiError(error.response.data.errors)
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }
    const onSuccess = () => {
        client.invalidateQueries(type === "driver" ? "driver list" : type === 'sales-agent' ? "salesAgent" : "user list")
        toast.success(`${type === "driver" ? "Driver" : type === 'sales-agent' ? "Sales Agent" : "User"} imported successfully.`);
        setpopup(false);
    }

    const driverUpload = useFileUpload(onSuccess, onError);
    const userUpload = useUserFileUpload(onSuccess, onError);
    const salesAgentUpload = useBulkUploadSalesAgent(onSuccess, onError);

    const handleFileUpload = () => {
        if (file) {
            const formData = new FormData();
            const fieldName = type === "driver" ? "driversSheet" : "driversSheet";
            formData.append(fieldName, file);

            if (type === "driver") {
                driverUpload.mutate(formData);
            }else if(type === 'sales-agent'){
                salesAgentUpload.mutate({ file })
            } else {
                userUpload.mutate(formData);
            }
        } else {
            alert("Please select a file first!");
        }
    };

    const triggerFileInput = () => {
        document.getElementById("fileInput").click();
    };

    const isPending = type === "driver" ? driverUpload.isPending  : type === 'sales-agent' ? salesAgentUpload.isPending : userUpload.isPending;
    const sampleFileName = type === "driver" ? "Sample_Driver.xlsx" : type === 'sales-agent' ? "Sample_SalesAgent.xlsx" : "Sample_User.xlsx";
    const downloadPath = type === "driver" ? "/assests/Driver.xlsx" : type === 'sales-agent' ? "/assests/SalesAgent.xlsx" : "/assests/Users.xlsx";
    console.log("File:", file);
    console.log("Is Pending:", isPending);

    const getImportText = () => {
        switch (type) {
            case "driver":
                return "drivers";
            case "user":
                return "users";
            case "sales-agent":
                return "sales agents";
            default:
                return "data";
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content ">
                <div className='import'>
                    <p className={`${popup === true ? "bg-transparent border-0 mb-3" : ""}`}>Please Choose a file to import {getImportText()}</p>
                    <div className="fileinput">
                        <input id="fileInput" type="file" onChange={handleFileChange} hidden />
                        <div className="filecontainer">
                            <button onClick={triggerFileInput}>Choose File</button>
                            <p>{file ? file.name : "No File Chosen"}</p>
                        </div>
                        <p className="fileerror">{error}</p>

                        <a className="samplefile" href={downloadPath} download={sampleFileName}>
                            Download Sample .xlsx file here <MdFileDownload className="icon" />
                        </a>
                    </div>

                    {apiError && apiError.length > 0 && (
                        <div className="error-list">
                            <ul>
                                {apiError.map((error, index) => (
                                    <li key={index} style={{ color: "red", fontSize: "small", textAlign: "left" }}>
                                        {error.message}({error.email})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="popup-buttons">
                        <button
                            className="popup-button confirm"
                            onClick={handleFileUpload}
                            disabled={!file || isPending}
                        >
                            {isPending ? <Loader color="black" /> : "Import"}
                        </button>
                        <button className="popup-button" onClick={() => setpopup(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportSheet;
