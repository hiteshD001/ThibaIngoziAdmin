/* eslint-disable react-hooks/exhaustive-deps */
import { useFormik } from "formik";
import {
  profileValidation_c,
  profileValidation_s,
} from "../common/FormValidation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";

const Profile = () => {
  const [role] = useState(localStorage.getItem("role"));
  const [edit, setedit] = useState(false);
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Profile Update Successfully.");
    client.invalidateQueries("userinfo");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
  }

  const { mutate, isPending } = useUpdateUser(onSuccess, onError)
  const userinfo = useGetUser(localStorage.getItem("userID"))

  const profileForm = useFormik({
    initialValues: role === "super_admin" ? super_admin : company,
    validationSchema:
      role === "super_admin" ? profileValidation_s : profileValidation_c,
    onSubmit: (values) => {
      setedit(false);
      console.log(values);
      mutate({ id: localStorage.getItem("userID"), data: values });
    },
  });

  useEffect(() => {
    profileForm.setValues(
      role === "super_admin"
        ? {
          first_name: userinfo.data?.data.user?.first_name || "",
          last_name: userinfo.data?.data.user?.last_name || "",
          email: userinfo.data?.data.user?.email || "",
          address: userinfo.data?.data.user?.address || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
        }
        : {
          contact_name: userinfo.data?.data.user?.contact_name || "",
          email: userinfo.data?.data.user?.email || "",
          address: userinfo.data?.data.user?.address || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
        }
    );
  }, [userinfo.data]);

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
                {role === "super_admin" ? (
                  <>
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        className="form-control"
                        value={profileForm.values.first_name}
                        onChange={profileForm.handleChange}
                        disabled={!edit}
                      />
                      {profileForm.touched.first_name && (
                        <p className="err">{profileForm.errors.first_name}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        className="form-control"
                        value={profileForm.values.last_name}
                        onChange={profileForm.handleChange}
                        disabled={!edit}
                      />
                      {profileForm.touched.last_name && (
                        <p className="err">{profileForm.errors.last_name}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="contact_name"
                      placeholder="Username"
                      className="form-control"
                      value={profileForm.values.contact_name}
                      onChange={profileForm.handleChange}
                      disabled={!edit}
                    />
                    {profileForm.touched.contact_name && (
                      <p className="err">{profileForm.errors.contact_name}</p>
                    )}
                  </div>
                )}
                <div className="col-md-6">
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="form-control"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.email && (
                    <p className="err">{profileForm.errors.email}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="mobile_no"
                    placeholder="Mobile No."
                    className="form-control"
                    value={profileForm.values.mobile_no}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.mobile_no && (
                    <p className="err">{profileForm.errors.mobile_no}</p>
                  )}
                </div>
                <div
                  className={role === "super_admin" ? "col-md-12" : "col-md-6"}
                >
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    className="form-control"
                    value={profileForm.values.address}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.address && (
                    <p className="err">{profileForm.errors.address}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-12 text-end">
          <div className="saveform">
            {edit ? (
              <button
                onClick={profileForm.handleSubmit}
                type="submit"
                className="btn btn-dark"
              >
                {isPending ? <Loader color="white" /> : "Save"}
              </button>
            ) : (
              <button onClick={() => setedit(true)} className="btn btn-dark">
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

const super_admin = {
  first_name: "",
  last_name: "",
  email: "",
  address: "",
  role: "",
  mobile_no: "",
};
const company = {
  contact_name: "",
  email: "",
  address: "",
  role: "",
  mobile_no: "",
};
