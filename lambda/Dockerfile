FROM public.ecr.aws/lambda/python:3.12

# curl（フォント取得用）。amazonlinux2023ベースなのでmicrodnfで入れる
RUN microdnf install -y tar gzip || true

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# 日本語フォント（Noto Sans JP variable）を同梱
RUN mkdir -p ${LAMBDA_TASK_ROOT}/fonts && \
    python -c "import urllib.request; urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf', '${LAMBDA_TASK_ROOT}/fonts/NotoSansJP-VF.ttf')"

COPY app.py ${LAMBDA_TASK_ROOT}/

CMD ["app.handler"]
