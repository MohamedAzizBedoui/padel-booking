-- CreateIndex
CREATE INDEX "Booking_courtId_date_startTime_idx" ON "Booking"("courtId", "date", "startTime");
