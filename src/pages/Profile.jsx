// /* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-hooks/exhaustive-deps */
import { useFormik } from "formik";
import {
  profileValidation_c,
  profileValidation_s,
} from "../common/FormValidation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser, useGetCountryList, useGetProvinceList } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const Profile = () => {
  const [role] = useState(localStorage.getItem("role"));
  const [edit, setedit] = useState(false);
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Profile Update Successfully.");
    client.invalidateQueries("userinfo");
  };
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption);
  };

  const { mutate, isPending } = useUpdateUser(onSuccess, onError);
  const userinfo = useGetUser(localStorage.getItem("userID"));

  const profileForm = useFormik({
    initialValues: role === "super_admin" ? super_admin : company,
    validationSchema:
      role === "super_admin" ? profileValidation_s : profileValidation_c,
    onSubmit: (values) => {
      setedit(false);
      const formData = new FormData();


      Object.keys(values).forEach(key => {
        if (key !== 'selfieImage' && key !== 'fullImage') {
          formData.append(key, values[key]);
        }
      });

      if (values.selfieImage && values.selfieImage instanceof File) {
        formData.append("selfieImage", values.selfieImage);
      }

      if (values.fullImage && values.fullImage instanceof File) {
        formData.append("fullImage", values.fullImage);
      }

      mutate({ id: localStorage.getItem("userID"), data: formData });
    },
  });

  const countrylist = useGetCountryList();
  const provincelist = useGetProvinceList(profileForm.values.country);

  useEffect(() => {
    console.log(userinfo.data?.data.user?.selfieImage)
    profileForm.setValues(
      role === "super_admin"
        ? {
          first_name: userinfo.data?.data.user?.first_name || "",
          last_name: userinfo.data?.data.user?.last_name || "",
          email: userinfo.data?.data.user?.email || "",
          street: userinfo.data?.data.user?.street || "",
          province: userinfo.data?.data.user?.province || "",
          city: userinfo.data?.data.user?.city || "",
          suburb: userinfo.data?.data.user?.suburb || "",
          postal_code: userinfo.data?.data.user?.postal_code || "",
          country: userinfo.data?.data.user?.country || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
          mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
        }
        : {
          selfieImage: userinfo.data?.data.user?.selfieImage || "",
          fullImage: userinfo.data?.data.user?.fullImage || "",
          contact_name: userinfo.data?.data.user?.contact_name || "",
          email: userinfo.data?.data.user?.email || "",
          street: userinfo.data?.data.user?.street || "",
          province: userinfo.data?.data.user?.province || "",
          city: userinfo.data?.data.user?.city || "",
          suburb: userinfo.data?.data.user?.suburb || "",
          postal_code: userinfo.data?.data.user?.postal_code || "",
          country: userinfo.data?.data.user?.country || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
          mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
        }
    );
  }, [userinfo.data]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>Profile</h3>
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
                  <PhoneInput
                    country={"za"}
                    disabled={!edit}
                    value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
                    onChange={(phone, countryData) => {
                      const withoutCountryCode = phone.startsWith(countryData.dialCode)
                        ? phone.slice(countryData.dialCode.length).trim()
                        : phone;

                      profileForm.setFieldValue("mobile_no", withoutCountryCode);
                      profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                    }}
                    inputClass="form-control"
                  />
                  {profileForm.touched.mobile_no && (
                    <p className="err">{profileForm.errors.mobile_no}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street"
                    className="form-control"
                    value={profileForm.values.street}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.street && (
                    <p className="err">{profileForm.errors.street}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <select
                    name="country"
                    className="form-control"
                    value={profileForm.values.country}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  >
                    <option value="" hidden>Country</option>
                    {countrylist.data?.data.data?.map((country) => (
                      <option key={country._id} value={country._id}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                  {profileForm.touched.country && (
                    <p className="err">{profileForm.errors.country}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <select
                    name="province"
                    className="form-control"
                    value={profileForm.values.province}
                    disabled={!profileForm.values.country || !edit}
                    onChange={profileForm.handleChange}
                  >
                    <option value="" hidden>Province</option>
                    {provincelist.data?.data.data?.map((province) => (
                      <option key={province._id} value={province._id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                  {profileForm.touched.province && (
                    <p className="err">{profileForm.errors.province}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className="form-control"
                    value={profileForm.values.city}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.city && (
                    <p className="err">{profileForm.errors.city}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="suburb"
                    placeholder="Suburb"
                    className="form-control"
                    value={profileForm.values.suburb}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.suburb && (
                    <p className="err">{profileForm.errors.suburb}</p>
                  )}
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    name="postal_code"
                    placeholder="Postal Code"
                    className="form-control"
                    value={profileForm.values.postal_code}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.postal_code && (
                    <p className="err">{profileForm.errors.postal_code}</p>
                  )}
                </div>
                {
                  profileForm.values.role == 'super_admin' ? "" : (
                    <div className="col-md-6"></div>
                  )
                }
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-6">
                      <label>Selfie Image</label>

                      {profileForm.values.selfieImage instanceof File ? (
                        <div className="form-control mt-2 img-preview-container">
                          <img
                            src={URL.createObjectURL(profileForm.values.selfieImage)}
                            alt="Selfie Preview"
                            className="img-preview"
                            width="100"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                        </div>
                      ) : (
                        userinfo.data?.data.user?.selfieImage && (
                          <div className="form-control mt-2 img-preview-container">
                            <img
                              src={userinfo.data?.data.user?.selfieImage}
                              alt="Selfie Image"
                              className="img-preview"
                              width="100"
                            />
                          </div>
                        )
                      )}

                      <div className="custom-file-input">
                        <input
                          type="file"
                          id="selfieImage"
                          accept="image/*"
                          disabled={!edit}
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            profileForm.setFieldValue("selfieImage", file);
                          }}
                        />
                        <label htmlFor="selfieImage">
                          Choose Selfie Image
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label>Full Image</label>

                      {profileForm.values.fullImage instanceof File ? (
                        <div className="form-control mt-2 img-preview-container">
                          <img
                            src={URL.createObjectURL(profileForm.values.fullImage)}
                            alt="full Image"
                            className="img-preview"
                            width="100"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                        </div>
                      ) : (
                        userinfo.data?.data.user?.fullImage && (
                          <div className="form-control mt-2 img-preview-container">
                            <img
                              src={userinfo.data?.data.user?.fullImage}
                              alt="full Image"
                              className="img-preview"
                              width="100"
                            />
                          </div>
                        )
                      )}

                      <div className="custom-file-input">
                        <input
                          type="file"
                          id="fullImage"
                          accept="image/*"
                          disabled={!edit}
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];

                            profileForm.setFieldValue("fullImage", file);
                          }}
                        />
                        <label htmlFor="fullImage">
                          Choose Full Image
                        </label>
                      </div>
                    </div>
                  </div>
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
  street: "",
  province: "",
  city: "",
  suburb: "",
  postal_code: "",
  country: "",
  role: "",
  mobile_no: "",
  mobile_no_country_code: "",
};
const company = {
  contact_name: "",
  email: "",
  street: "",
  province: "",
  city: "",
  suburb: "",
  postal_code: "",
  country: "",
  role: "",
  mobile_no: "",
  mobile_no_country_code: "",
};










// import { useFormik } from "formik";
// import {
//   profileValidation_c,
//   profileValidation_s,
// } from "../common/FormValidation";
// import { useEffect, useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useGetUser, useUpdateUser } from "../API Calls/API";
// import { toast } from "react-toastify";
// import { toastOption } from "../common/ToastOptions";
// import Loader from "../common/Loader";
// import PhoneInput from "react-phone-input-2";

// const Profile = () => {
//   const [role] = useState(localStorage.getItem("role"));
//   const [edit, setedit] = useState(false);
//   const client = useQueryClient();

//   const onSuccess = () => {
//     toast.success("Profile Update Successfully.");
//     client.invalidateQueries("userinfo");
//   }
//   const onError = (error) => {
//     toast.error(error.response.data.message || "Something went Wrong", toastOption)
//   }

//   const { mutate, isPending } = useUpdateUser(onSuccess, onError)
//   const userinfo = useGetUser(localStorage.getItem("userID"))

//   const profileForm = useFormik({
//     initialValues: role === "super_admin" ? super_admin : company,
//     validationSchema:
//       role === "super_admin" ? profileValidation_s : profileValidation_c,
//     onSubmit: (values) => {
//       setedit(false);
//       mutate({ id: localStorage.getItem("userID"), data: values });
//     },
//   });

//   useEffect(() => {
//     profileForm.setValues(
//       role === "super_admin"
//         ? {
//           first_name: userinfo.data?.data.user?.first_name || "",
//           last_name: userinfo.data?.data.user?.last_name || "",
//           email: userinfo.data?.data.user?.email || "",
//           address: userinfo.data?.data.user?.address || "",
//           role: userinfo.data?.data.user?.role || "",
//           mobile_no: userinfo.data?.data.user?.mobile_no || "",
//           mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
//         }
//         : {
//           contact_name: userinfo.data?.data.user?.contact_name || "",
//           email: userinfo.data?.data.user?.email || "",
//           address: userinfo.data?.data.user?.address || "",
//           role: userinfo.data?.data.user?.role || "",
//           mobile_no: userinfo.data?.data.user?.mobile_no || "",
//           mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
//         }
//     );
//   }, [userinfo.data]);

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-md-12">
//           <div className="theme-table">
//             <div className="tab-heading">
//               <h3>Profile </h3>
//             </div>
//             <form>
//               <div className="row">
//                 {role === "super_admin" ? (
//                   <>
//                     <div className="col-md-6">
//                       <input
//                         type="text"
//                         name="first_name"
//                         placeholder="First Name"
//                         className="form-control"
//                         value={profileForm.values.first_name}
//                         onChange={profileForm.handleChange}
//                         disabled={!edit}
//                       />
//                       {profileForm.touched.first_name && (
//                         <p className="err">{profileForm.errors.first_name}</p>
//                       )}
//                     </div>
//                     <div className="col-md-6">
//                       <input
//                         type="text"
//                         name="last_name"
//                         placeholder="Last Name"
//                         className="form-control"
//                         value={profileForm.values.last_name}
//                         onChange={profileForm.handleChange}
//                         disabled={!edit}
//                       />
//                       {profileForm.touched.last_name && (
//                         <p className="err">{profileForm.errors.last_name}</p>
//                       )}
//                     </div>
//                   </>
//                 ) : (
//                   <div className="col-md-6">
//                     <input
//                       type="text"
//                       name="contact_name"
//                       placeholder="Username"
//                       className="form-control"
//                       value={profileForm.values.contact_name}
//                       onChange={profileForm.handleChange}
//                       disabled={!edit}
//                     />
//                     {profileForm.touched.contact_name && (
//                       <p className="err">{profileForm.errors.contact_name}</p>
//                     )}
//                   </div>
//                 )}
//                 <div className="col-md-6">
//                   <input
//                     type="text"
//                     name="email"
//                     placeholder="Email"
//                     className="form-control"
//                     value={profileForm.values.email}
//                     onChange={profileForm.handleChange}
//                     disabled={!edit}
//                   />
//                   {profileForm.touched.email && (
//                     <p className="err">{profileForm.errors.email}</p>
//                   )}
//                 </div>
//                 <div className="col-md-6">
//                   <PhoneInput
//                     country={"za"}
//                     disabled={!edit}
//                     value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
//                     onChange={(phone, countryData) => {
//                       const withoutCountryCode = phone.startsWith(countryData.dialCode)
//                         ? phone.slice(countryData.dialCode.length).trim()
//                         : phone;

//                       profileForm.setFieldValue("mobile_no", withoutCountryCode);
//                       profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
//                     }}
//                     inputClass="form-control"
//                   />
//                   {profileForm.touched.mobile_no && (
//                     <p className="err">{profileForm.errors.mobile_no}</p>
//                   )}
//                 </div>
//                 <div
//                   className={role === "super_admin" ? "col-md-12" : "col-md-6"}
//                 >
//                   <input
//                     type="text"
//                     name="address"
//                     placeholder="Address"
//                     className="form-control"
//                     value={profileForm.values.address}
//                     onChange={profileForm.handleChange}
//                     disabled={!edit}
//                   />
//                   {profileForm.touched.address && (
//                     <p className="err">{profileForm.errors.address}</p>
//                   )}
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//         <div className="col-md-12 text-end">
//           <div className="saveform">
//             {edit ? (
//               <button
//                 onClick={profileForm.handleSubmit}
//                 type="submit"
//                 className="btn btn-dark"
//               >
//                 {isPending ? <Loader color="white" /> : "Save"}
//               </button>
//             ) : (
//               <button onClick={() => setedit(true)} className="btn btn-dark">
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// const super_admin = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   address: "",
//   role: "",
//   mobile_no: "",
//   mobile_no_country_code: ""
// };
// const company = {
//   contact_name: "",
//   email: "",
//   address: "",
//   role: "",
//   mobile_no: "",
//   mobile_no_country_code: ""
// };
