import { useState } from "react";
import { useNavigate } from "react-router-dom";

import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";


import { DeleteSosAmount } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfWantedPerson = () => {
    const nav = useNavigate();
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");
    const totalPages = 1

    const wantedPersonList = [
        {
            "id": "1",
            "fullName": "John Doe",
            "aliases": ["Johnny D", "JD"],
            "offenses": ["Armed Robbery", "Assault"],
            "incidentDate": "2025-05-12",
            "location": {
                "country": "South Africa",
                "province": "Gauteng",
                "city": "Johannesburg",
                "suburb": "Hillbrow"
            },
            "caseNumber": "SAPS-2025-00123",
            "contactNumber": "0800 10111",
            "status": "Wanted",
            "images": [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ],
            "description": "Last seen wearing a black hoodie. Often seen near downtown bars. Known to be aggressive and carries a weapon."
        },
        {
            "id": "2",
            "fullName": "Jane Smith",
            "aliases": ["Blade"],
            "offenses": ["Hijacking"],
            "incidentDate": "2025-06-02",
            "location": {
                "country": "South Africa",
                "province": "Western Cape",
                "city": "Cape Town",
                "suburb": "Khayelitsha"
            },
            "caseNumber": "SAPS-2025-00345",
            "contactNumber": "021 467 8001",
            "status": "Captured",
            "images": [
                "https://example.com/image3.jpg"
            ],
            "description": "Captured on 2025-06-10 after a community tip-off. Previously seen driving a stolen grey Toyota Corolla."
        }
    ]

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>List of wanted by SAPS</h3>
                            <div className="tbl-filter">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <img src={search} />
                                    </span>
                                    <input
                                        type="text"
                                        value={filter}
                                        onChange={(e) => setfilter(e.target.value)}
                                        className="form-control"
                                        placeholder="Search"
                                    />
                                    <span className="input-group-text">
                                        <img src={icon} />
                                    </span>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => nav("add-wanted")}
                                >
                                    + Add Wanted
                                </button>
                            </div>
                        </div>
                        {!wantedPersonList ? (
                            <Loader />
                        ) : (
                            <>
                                {wantedPersonList ? (
                                    <>
                                        <table
                                            id="example"
                                            className="table table-striped nowrap"
                                            style={{ width: "100%" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>Full Name / Alias</th>
                                                    <th>Offense(s)</th>
                                                    <th>Date of Incident</th>
                                                    <th>Case Number</th>
                                                    <th>Officer Contact</th>
                                                    <th>Status</th>
                                                    <th>&nbsp;</th>
                                                    <th>&nbsp;</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {wantedPersonList.map((data) => (
                                                    <tr key={data.id}>
                                                        <td>
                                                            {data.fullName}
                                                            {data.aliases?.length ? ` (${data.aliases.join(", ")})` : ""}
                                                        </td>
                                                        <td>{data.offenses.join(", ")}</td>
                                                        <td>{data.incidentDate}</td>
                                                        <td>{data.caseNumber}</td>
                                                        <td>{data.contactNumber}</td>
                                                        <td>
                                                            <span className={`badge ${data.status === "Captured" ? "bg-success" : "bg-danger"}`}>
                                                                {data.status}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                onClick={() => setconfirmation(data.id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === data.id && (
                                                                <DeleteSosAmount
                                                                    id={data.id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}

                                                        </td>
                                                        <td>
                                                            <span
                                                                onClick={() =>
                                                                    nav(`/home/total-wanted/wanted-person/${data.id}`)
                                                                }
                                                                className="tbl-btn"
                                                            >
                                                                view
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="pagiation">
                                            <div className="pagiation-left">
                                                <button disabled={page === 1} onClick={() => setpage((p) => p - 1)}>
                                                    <img src={Prev} /> Prev
                                                </button>
                                            </div>
                                            <div className="pagiation-right">
                                                <button
                                                    disabled={page === totalPages}
                                                    onClick={() => setpage((p) => p + 1)}
                                                >
                                                    Next <img src={Next} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="no-data-found">No data found</p>
                                )}

                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListOfWantedPerson;
