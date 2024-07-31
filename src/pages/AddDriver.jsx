
const AddDriver = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Add Driver Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input type="text" name="fname" placeholder="First Name" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="lname" placeholder="Last Name" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="email" placeholder="Email" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="mobileno" placeholder="Mobile No." className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="address" placeholder="Address" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="idno" placeholder="ID No." className="form-control" />
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

export default AddDriver
