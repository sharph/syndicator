FROM python:3.11

RUN mkdir /app

WORKDIR /app

COPY requirements.txt /app

RUN mkdir /app/staticfiles

RUN pip install -r requirements.txt

COPY . /app

RUN ./manage.py collectstatic

EXPOSE 8000

ARG GITHUB_SHA=unknown
ENV GIT_HASH=${GITHUB_SHA}

CMD ["gunicorn", "syndicatorapi.wsgi", "--bind", "0.0.0.0:8000"]

