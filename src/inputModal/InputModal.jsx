import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  TextField,
  Radio,
  Stack,
  MenuItem,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import { timeTableState } from "../store/store";
import { v4 as uuidv1 } from "uuid";

const timeOptions = new Array(12)
  .fill(null)
  .map((e, i) => ({ value: i + 9, label: i + 9 }));

const checkOverLap = (A, B) =>
  B.start < A.start ? B.end > A.start : B.start < A.end;

function InputModal({
  showModal,
  handleClose,
  dayData = "mon",
  startTimeData = 9,
  endTimeData = 10,
  lectureNameData = "",
  colorData = "#00ff55",
  idNum,
}) {
  const {
    formState: { errors },
    control,
    getValues,
    handleSubmit,
    reset,
  } = useForm();
  const [timeTableData, settimeTableData] = useRecoilState(timeTableState);

  useEffect(() => {
    if (showModal) {
      reset({
        lectureName: lectureNameData,
        day: dayData,
        startTime: startTimeData,
        endTime: endTimeData,
        lectureColor: colorData,
      });
    }
  }, [
    showModal,
    reset,
    dayData,
    startTimeData,
    endTimeData,
    lectureNameData,
    colorData,
  ]);

  const Submit = useCallback(
    ({ lectureName, day, startTime, endTime, lectureColor }) => {
      let valid = true;
      for (let index = 0; index < timeTableData[day].length; index++) {
        if (
          checkOverLap(timeTableData[day][index], {
            start: startTime,
            end: endTime,
          })
        ) {
          valid = false;
          break;
        }
      }

      if (!valid) {
        alert("A lecture already exists at that time");
        return;
      }

      const data = {
        start: startTime,
        end: endTime,
        name: lectureName,
        color: lectureColor,
        id: uuidv1(),
      };

      settimeTableData((oldTimeData) => ({
        ...oldTimeData,
        [day]: [...oldTimeData[day], data],
      }));

      handleClose();
    },
    [timeTableData, settimeTableData, handleClose]
  );

  const Edit = useCallback(
    ({ lectureName, day, startTime, endTime, lectureColor }) => {
      let valid = true;
      for (let index = 0; index < timeTableData[day].length; index++) {
        if (
          checkOverLap(timeTableData[day][index], {
            start: startTime,
            end: endTime,
          }) &&
          timeTableData[day][index]["id"] !== idNum
        ) {
          valid = false;
          break;
        }
      }

      if (!valid) {
        alert("A lecture already exists at that time");
        return;
      }

      const filteredDayData = [
        ...timeTableData[dayData].filter((data) => data.id !== idNum),
      ];

      const newTimeTableData = {
        ...timeTableData,
        [dayData]: filteredDayData,
      };

      const newDayData = [
        ...newTimeTableData[day],
        {
          start: startTime,
          end: endTime,
          id: idNum,
          name: lectureName,
          color: lectureColor,
        },
      ];

      settimeTableData({
        ...newTimeTableData,
        [day]: newDayData,
      });

      handleClose();
    },
    [dayData, handleClose, idNum, settimeTableData, timeTableData]
  );

  return (
    <Dialog open={showModal} onClose={handleClose}>
      <form onSubmit={handleSubmit(idNum ? Edit : Submit)}>
        <DialogTitle>Add lecture</DialogTitle>
        <DialogContent style={{ width: "400px" }}>
          <Controller
            control={control}
            name="lectureName"
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                error={!!errors.lectureName}
                style={{ marginTop: "30px", width: "350px" }}
                autoComplete="off"
                label="lecture name"
              />
            )}
          />
          {errors.lectureName?.type === "required" && (
            <p style={{ color: "#d32f2f" }}>Type lecture name</p>
          )}

          <FormControl style={{ marginTop: "30px" }}>
            <FormLabel>Day</FormLabel>
            <Controller
              control={control}
              name="day"
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup {...field} style={{ display: "block" }}>
                  <FormControlLabel
                    value="mon"
                    control={<Radio />}
                    label="Mon"
                  />
                  <FormControlLabel
                    value="tue"
                    control={<Radio />}
                    label="Tue"
                  />
                  <FormControlLabel
                    value="wed"
                    control={<Radio />}
                    label="Wed"
                  />
                  <FormControlLabel
                    value="thu"
                    control={<Radio />}
                    label="Thu"
                  />
                  <FormControlLabel
                    value="fri"
                    control={<Radio />}
                    label="Fri"
                  />
                </RadioGroup>
              )}
            />
          </FormControl>
          <Stack spacing={3} style={{ marginTop: "30px", width: "350px" }}>
            <Controller
              control={control}
              name="startTime"
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  error={
                    !!errors.startTime ||
                    !!(errors.endTime?.type === "validate")
                  }
                  style={{ marginTop: "30px", width: "350px" }}
                  label="Start time"
                  placeholder="Choose start time"
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {errors.startTime?.type === "required" && (
              <p style={{ color: "#d32f2f" }}>Choose start time</p>
            )}

            <Controller
              control={control}
              name="endTime"
              rules={{
                required: true,
                validate: (value) => getValues("startTime") < value,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  error={!!errors.endTime}
                  style={{ marginTop: "30px", width: "350px" }}
                  label="End time"
                  placeholder="Choose end time"
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {errors.endTime?.type === "required" && (
              <p style={{ color: "#d32f2f" }}>Choose end time</p>
            )}
            {errors.endTime?.type === "validate" && (
              <p style={{ color: "#d32f2f" }}>Check start time and end time</p>
            )}
          </Stack>
          <div style={{ marginTop: "30px" }}>
            <label htmlFor="lectureColor">Table color:</label>
            <Controller
              control={control}
              name="lectureColor"
              render={({ field }) => (
                <input
                  {...field}
                  style={{ marginLeft: "30px" }}
                  id="lectureColor"
                  type="color"
                />
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default InputModal;
