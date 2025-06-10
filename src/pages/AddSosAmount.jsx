import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { toastOption } from "../common/ToastOptions";
import { useLayoutEffect, useState } from "react";
import { SosAmount } from "../common/FormValidation";
import { useGetServicesList } from "../API Calls/API";
import { useFormik } from "formik";
import { useCreateSosAmount } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "../common/Loader";

const AddSosAmount = () => {
    const client = useQueryClient();
    const [servicesList, setServicesList] = useState([])
    const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const serviceslist = useGetServicesList()
    const sosform = {
        amount: "",
        driverSplitAmount: "",
        companySplitAmount: "",
        currency: "",
        notificationTypeId: ""
    };
    const onSuccess = () => {
        toast.success("Sos added successfully.");
        Sosform.resetForm();
        client.invalidateQueries("ArmedSOSAmount List");
        nav("/home/total-sos-amount");
    };

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };

    const newSos = useCreateSosAmount(onSuccess, onError);



    const Sosform = useFormik({
        initialValues: sosform,
        validationSchema: SosAmount,
        onSubmit: (values) => {
            const payload = {
                amount: Number(values.amount),
                driverSplitAmount: Number(values.driverSplitAmount),
                companySplitAmount: Number(values.companySplitAmount),
                currency: values.currency,
                notificationTypeId: values.notificationTypeId,
            };
            newSos.mutate(payload);
        },
    });

    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter(service => service);

            const groupedOptions = [
                {
                    label: "Services",
                    options: filteredServices.map((service) => ({
                        label: service.type,
                        value: service._id,
                    })),
                }
            ];

            setServicesList(groupedOptions);
        }
    }, [serviceslist]);


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <form>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tab-heading">
                                        <h3>Sos Information</h3>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <input
                                                type="number"
                                                name="amount"
                                                placeholder="amount"
                                                className="form-control"
                                                value={Sosform.values.amount}
                                                onChange={Sosform.handleChange}
                                            />
                                            {Sosform.touched.amount && (
                                                <p className="err">{Sosform.errors.amount}</p>
                                            )}
                                            <input
                                                type="number"
                                                name="driverSplitAmount"
                                                placeholder="driverSplitAmount"
                                                className="form-control"
                                                value={Sosform.values.driverSplitAmount}
                                                onChange={Sosform.handleChange}
                                            />
                                            {Sosform.touched.driverSplitAmount && (
                                                <p className="err">{Sosform.errors.driverSplitAmount}</p>
                                            )}
                                            <input
                                                type="number"
                                                name="companySplitAmount"
                                                placeholder="companySplitAmount"
                                                className="form-control"
                                                value={Sosform.values.companySplitAmount}
                                                onChange={Sosform.handleChange}
                                            />
                                            {Sosform.touched.companySplitAmount && (
                                                <p className="err">{Sosform.errors.companySplitAmount}</p>
                                            )}

                                        </div>
                                        <div className="col-md-6">

                                            <input
                                                type="text"
                                                name="currency"
                                                placeholder="currency"
                                                className="form-control"
                                                value={Sosform.values.currency}
                                                onChange={Sosform.handleChange}
                                            />
                                            {Sosform.touched.currency && (
                                                <p className="err">{Sosform.errors.currency}</p>
                                            )}
                                            <Select
                                                name="notificationTypeId"
                                                options={servicesList}
                                                placeholder="Select Service"
                                                classNamePrefix="select"
                                                className="form-control add-company-services"
                                                value={servicesList
                                                    .flatMap((group) => group.options)
                                                    .find((option) => option.value === Sosform.values.notificationTypeId)}
                                                onChange={(selectedOption) => {
                                                    Sosform.setFieldValue("notificationTypeId", selectedOption?.value || "");
                                                }}
                                                styles={{
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isSelected
                                                            ? "white"
                                                            : state.isFocused
                                                                ? "#e6e6e6"
                                                                : "white",
                                                        color: "black",
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        maxHeight: "50px",
                                                        overflowY: "auto",
                                                    }),
                                                }}
                                            />

                                            {Sosform.touched.notificationTypeId && Sosform.errors.notificationTypeId && (
                                                <p className="err">{Sosform.errors.notificationTypeId}</p>
                                            )}
                                        </div>
                                    </div>



                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        <button
                            type="submit"
                            onClick={Sosform.handleSubmit}
                            className="btn btn-dark"
                            disabled={newSos.isPending}
                        >
                            {newSos.isPending ? <Loader color="white" /> : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSosAmount;



