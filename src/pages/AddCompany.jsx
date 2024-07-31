

const AddCompany = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>List of Companies</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input type="text" name="companyname" placeholder="Company Name" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="email" placeholder="Email" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="mobileno" placeholder="Mobile No." className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="bio" placeholder="Company Bio." className="form-control" />
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

export default AddCompany
