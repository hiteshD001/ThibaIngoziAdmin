// /* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-hooks/exhaustive-deps */
import { useFormik } from "formik";
import {
    armedSosSplitAmountValidation
} from "../common/FormValidation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetArmedSosSplitAmount, useUpdateArmedSosSplitAmount } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";;

const Profile = () => {
  const [edit, setedit] = useState(false);
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Profile Update Successfully.");
    client.invalidateQueries("armedSosSplitAmountInfo");
  };
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption);
  };

  const { mutate, isPending } = useUpdateArmedSosSplitAmount(onSuccess, onError);
  const armedSosSplitAmountInfo = useGetArmedSosSplitAmount();

  const armedSosSplitAmountForm = useFormik({
    initialValues: armed_Sos_Split_amount,
    validationSchema: armedSosSplitAmountValidation,
    onSubmit: (values) => {
      setedit(false);
    //   const formData = new FormData();

    //   Object.keys(values).forEach(key => {
    //     if (key !== 'selfieImage' && key !== 'fullImage') {
    //       formData.append(key, values[key]);
    //     }
    //   });

      mutate({ data: values });
    },
  });

  useEffect(() => {
    console.log(armedSosSplitAmountInfo.data?.data?.data)
    armedSosSplitAmountForm.setValues(
        {
          armedSosAmount: armedSosSplitAmountInfo.data?.data?.data?.armedSosAmount || "",
          driverSplitAmount: armedSosSplitAmountInfo.data?.data?.data?.driverSplitAmount || "",
          companySplitAmount: armedSosSplitAmountInfo.data?.data?.data?.companySplitAmount || "",
          currency: armedSosSplitAmountInfo.data?.data?.data?.currency || ""
        }
    );
  }, [armedSosSplitAmountInfo.data]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>Armed Sos Split Amount Management</h3>
            </div>
            <form>
                <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="armedSosAmount"
                        placeholder="Armed Sos Amount"
                        className="form-control"
                        value={armedSosSplitAmountForm.values.armedSosAmount}
                        onChange={armedSosSplitAmountForm.handleChange}
                        disabled={!edit}
                      />
                      {armedSosSplitAmountForm.touched.armedSosAmount && (
                        <p className="err">{armedSosSplitAmountForm.errors.armedSosAmount}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="driverSplitAmount"
                        placeholder="Driver Split Amount"
                        className="form-control"
                        value={armedSosSplitAmountForm.values.driverSplitAmount}
                        onChange={armedSosSplitAmountForm.handleChange}
                        disabled={!edit}
                      />
                      {armedSosSplitAmountForm.touched.driverSplitAmount && (
                        <p className="err">{armedSosSplitAmountForm.errors.driverSplitAmount}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                        <input
                        type="text"
                        name="companySplitAmount"
                        placeholder="Company Split Amount"
                        className="form-control"
                        value={armedSosSplitAmountForm.values.companySplitAmount}
                        onChange={armedSosSplitAmountForm.handleChange}
                        disabled={!edit}
                        />
                        {armedSosSplitAmountForm.touched.companySplitAmount && (
                        <p className="err">{armedSosSplitAmountForm.errors.companySplitAmount}</p>
                        )}
                    </div>
                    <div className="col-md-6">
                    <input
                        type="text"
                        name="currency"
                        placeholder="Currency"
                        className="form-control"
                        value={armedSosSplitAmountForm.values.currency}
                        onChange={armedSosSplitAmountForm.handleChange}
                        disabled={!edit}
                    />
                    {armedSosSplitAmountForm.touched.currency && (
                        <p className="err">{armedSosSplitAmountForm.errors.currency}</p>
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
                onClick={armedSosSplitAmountForm.handleSubmit}
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

const armed_Sos_Split_amount = {
  armedSosAmount: "",
  driverSplitAmount: "",
  companySplitAmount: "",
  currency: "",
};