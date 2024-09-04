/* eslint-disable react/prop-types */
import { useState } from "react";
import { useFileUpload } from "../API Calls/API";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { toastOption } from "./ToastOptions";
import { useQueryClient } from "@tanstack/react-query";

const ImportSheet = ({ setpopup }) => {
    const [file, setFile] = useState(null);
    const [error, seterror] = useState("")

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

    const onError = (error) => { console.log(error); toast.error(error.response.data.message || "Something went Wrong", toastOption) }
    const onSuccess = () => {
        client.invalidateQueries("driver list")
        toast.success("Imported successfully.");
        setpopup(false);
    }

    const upload = useFileUpload(onSuccess, onError);

    const handleFileUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append("driversSheet", file);

            console.log(formData);

            upload.mutate(formData);
        } else {
            alert("Please select a file first!");
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="import">
                    <p>Please Choose a file to import</p>
                    <div className="fileinput">
                        <input type="file" onChange={handleFileChange} />
                        <p className="fileerror">{error}</p>
                    </div>
                    <div className="popup-buttons">
                        <button
                            className="popup-button confirm"
                            onClick={handleFileUpload}
                            disabled={!file || upload.isPending}
                        >
                            {upload.isPending ? <Loader color="black" /> : "Import"}
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
