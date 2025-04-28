import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { SosAmount } from "../common/FormValidation";
import Select from "react-select";
import { useGetSoSAmount, useUpdateSosAmount, useGetServicesList } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";


const ArmedSosAmount = () => {
    const { id } = useParams();
    const [edit, setEdit] = useState(false);
    const client = useQueryClient();
    const [servicesList, setServicesList] = useState([])
    const { data, refetch } = useGetSoSAmount(id);
    const serviceslist = useGetServicesList()

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    const sosForm = useFormik({
        initialValues: {
            amount: 0,
            driverSplitAmount: 0,
            companySplitAmount: 0,
            currency: "",
            notificationTypeId: "",
        },
        validationSchema: SosAmount,
        onSubmit: (values) => {
            const updatedValues = {
                notificationTypeId: values.notificationTypeId,
                amount: values.amount,
                driverSplitAmount: values.driverSplitAmount,
                companySplitAmount: values.companySplitAmount,
                currency: values.currency,
            };
            mutate({ id, data: updatedValues });
            setEdit(false);
        },
    });

    const onSuccess = () => {
        toast.success("SOS amount updated successfully.");
        client.invalidateQueries("ArmedSOSAmount List");
    };
    const onError = (error) => {
        toast.error(
            error.response?.data?.message || "Something went wrong", toastOption
        );
        console.log(error)
    };
    const { mutate } = useUpdateSosAmount(onSuccess, onError);


    useEffect(() => {
        if (data?.data) {
            const values = data?.data?.data;
            sosForm.setValues({
                notificationTypeId: values?.notificationTypeId || '',
                amount: values?.amount || 0,
                driverSplitAmount: values?.driverSplitAmount || 0,
                companySplitAmount: values?.companySplitAmount || 0,
                currency: values?.currency || "",
            });
        }
    }, [data?.data]);


    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter(service => service.isService);

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
                        <div className="tab-heading">
                            <h3>SOS Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="amount">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        placeholder="Amount"
                                        className="form-control"
                                        value={sosForm.values.amount}
                                        onChange={sosForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {sosForm.touched.amount && <p className="err">{sosForm.errors.amount}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="driverSplitAmount">Driver Split Amount</label>
                                    <input
                                        type="number"
                                        name="driverSplitAmount"
                                        id="driverSplitAmount"
                                        placeholder="Driver Split Amount"
                                        className="form-control"
                                        value={sosForm.values.driverSplitAmount}
                                        onChange={sosForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {sosForm.touched.driverSplitAmount && <p className="err">{sosForm.errors.driverSplitAmount}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="companySplitAmount">Company Split Amount</label>
                                    <input
                                        type="number"
                                        name="companySplitAmount"
                                        id="companySplitAmount"
                                        placeholder="Company Split Amount"
                                        className="form-control"
                                        value={sosForm.values.companySplitAmount}
                                        onChange={sosForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {sosForm.touched.companySplitAmount && <p className="err">{sosForm.errors.companySplitAmount}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="currency">Currency</label>
                                    <input
                                        type="text"
                                        name="currency"
                                        id="currency"
                                        placeholder="Currency"
                                        className="form-control"
                                        value={sosForm.values.currency}
                                        onChange={sosForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {sosForm.touched.currency && <p className="err">{sosForm.errors.currency}</p>}
                                </div>
                                <div className="col-md-6">
                                    <Select
                                        name="notificationTypeId"
                                        options={servicesList}
                                        placeholder="Select Service"
                                        classNamePrefix="select"
                                        // className=""
                                        isDisabled={!edit}
                                        value={servicesList
                                            .flatMap((group) => group.options)
                                            .find((option) => option.value === sosForm.values.notificationTypeId)}
                                        onChange={(selectedOption) => {
                                            sosForm.setFieldValue("notificationTypeId", selectedOption?.value || "");
                                        }}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: "10px",
                                                borderRadius: '12px',
                                                height: '60px'
                                            }),
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

                                    {sosForm.touched.notificationTypeId && sosForm.errors.notificationTypeId && (
                                        <p className="err">{sosForm.errors.notificationTypeId}</p>
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
                                type="submit"
                                onClick={sosForm.handleSubmit}
                                className="btn btn-dark"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                onClick={() => setEdit(true)}
                                className="btn btn-dark"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmedSosAmount;
