
const Profile = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Profile </h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input type="text" name="fname" placeholder="First Name" className="form-control" value={profileData.fname} />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="lname" placeholder="Last Name" className="form-control" value={profileData.lname} />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="email" placeholder="Email" className="form-control" value={profileData.email} />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="mobileno" placeholder="Mobile No." className="form-control" value={profileData.phoneNo} />
                                </div>
                                <div className="col-md-12">
                                    <input type="text" name="address" placeholder="Address" className="form-control" value={profileData.address} />
                                </div>
                            </div>
                        </form>
                    </div>


                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        <button className="btn btn-dark">Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile

const profileData = {
    fname: "Kenneth",
    lname: "King",
    email: "kenneth.king@guard.co",
    address: "address",
    phoneNo: "+27 98250 98250"
}