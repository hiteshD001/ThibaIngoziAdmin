import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useFormik } from "formik";
import { useCreateNotificationType } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import Loader from "../common/Loader";

const AddService = () => {
    const client = useQueryClient();
    const nav = useNavigate();

    // Success callback
    const onSuccess = () => {
        toast.success("Service added successfully.");
        serviceForm.resetForm();
        client.invalidateQueries("NotificationType List"); // Update this query key if needed
        nav("/home/total-sos-amount");
    };

    // Error callback
    const onError = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong", toastOption);
    };

    const newService = useCreateNotificationType(onSuccess, onError);

    // Formik form config
    const serviceForm = useFormik({
        initialValues: {
            type: "",
        },
        validationSchema: Yup.object({
            type: Yup.string().required("Service name is required"),
        }),
        onSubmit: (values) => {
            const payload = {
                type: values.type,
                isService: true,
            };
            newService.mutate(payload);
        },
    });

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <form onSubmit={serviceForm.handleSubmit}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tab-heading">
                                        <h3>Add New Service</h3>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mt-2">
                                            <input
                                                type="text"
                                                name="type"
                                                placeholder="Service Name"
                                                className="form-control"
                                                value={serviceForm.values.type}
                                                onChange={serviceForm.handleChange}
                                                onBlur={serviceForm.handleBlur}
                                            />
                                            {serviceForm.touched.type && serviceForm.errors.type && (
                                                <p className="err">{serviceForm.errors.type}</p>
                                            )}
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={newService.isPending}
                                            >
                                                {newService.isPending ? <Loader color="white" /> : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                    {/* <div className="col-md-12">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={newService.isPending}
                                        >
                                            {newService.isPending ? <Loader color="white" /> : "Save"}
                                        </button>
                                    </div> */}
                                </div>
                            </div>


                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddService;
